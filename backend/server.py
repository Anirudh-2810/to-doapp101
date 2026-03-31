from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, HTTPException, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
import secrets
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Velocity-One API", "status": "online"}

JWT_ALGORITHM = "HS256"
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

CATEGORIES = ["General", "Deep Work", "Email", "Meetings", "Creative", "Admin", "Learning", "Health"]


# ========== AUTH HELPERS ==========
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_jwt_secret():
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(401, "User not found")
        user["id"] = str(user["_id"])
        del user["_id"]
        user.pop("password_hash", None)
        user.pop("google_tokens", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


# ========== BRUTE FORCE ==========
async def check_brute_force(identifier: str):
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.now(timezone.utc) < datetime.fromisoformat(locked_until):
            raise HTTPException(429, "Too many login attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})


async def record_failed_attempt(identifier: str):
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt:
        new_count = attempt.get("count", 0) + 1
        update_data = {"count": new_count}
        if new_count >= 5:
            update_data["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update_data})
    else:
        await db.login_attempts.insert_one({"identifier": identifier, "count": 1})


async def clear_failed_attempts(identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


# ========== PRIORITY ALGORITHM ==========
def calculate_task_score(task: dict, energy_level: int = 5) -> float:
    now = datetime.now(timezone.utc)
    try:
        deadline_str = task.get("deadline", "")
        if deadline_str:
            deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
        else:
            deadline = now + timedelta(days=7)
    except Exception:
        deadline = now + timedelta(days=7)

    days_until = max(0, (deadline - now).total_seconds() / 86400)
    urgency = min(10, max(1, 10 - days_until)) if days_until > 0 else 10
    importance = task.get("priority", 2) * 3.33
    d = min(days_until, 30)

    score = (urgency * 0.5) + (importance * 0.3) - (d * 0.2)

    complexity = task.get("complexity", 5)
    load_mismatch = abs(energy_level - complexity)
    if load_mismatch <= 2:
        score += 2.0
    else:
        score -= load_mismatch * 0.3

    return round(score, 1)


# ========== MODELS ==========
class RegisterReq(BaseModel):
    email: str
    password: str
    name: str


class LoginReq(BaseModel):
    email: str
    password: str


class TaskCreate(BaseModel):
    text: str
    priority: int = 2
    complexity: int = 5
    deadline: str = ""
    category: str = "General"
    parent_id: Optional[str] = None


class TaskUpdate(BaseModel):
    text: Optional[str] = None
    priority: Optional[int] = None
    complexity: Optional[int] = None
    deadline: Optional[str] = None
    category: Optional[str] = None


class EnergyUpdate(BaseModel):
    energy_level: int


# ========== AUTH ROUTES ==========
@api_router.post("/auth/register")
async def register(req: RegisterReq, response: Response):
    email = req.email.lower().strip()
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_doc = {
        "email": email,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "role": "user",
        "energy_level": 5,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    await db.telemetry.insert_one({
        "user_id": user_id,
        "velocity_score": 50.0,
        "streak": 0,
        "streak_last_date": "",
        "cognitive_match_rate": 50.0,
        "total_completed": 0,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": req.name, "role": "user"}


@api_router.post("/auth/login")
async def login(req: LoginReq, request: Request, response: Response):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_brute_force(identifier)
    user = await db.users.find_one({"email": email})
    if not user:
        await record_failed_attempt(identifier)
        raise HTTPException(401, "Invalid email or password")
    if not verify_password(req.password, user["password_hash"]):
        await record_failed_attempt(identifier)
        raise HTTPException(401, "Invalid email or password")
    await clear_failed_attempts(identifier)
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user.get("name", ""), "role": user.get("role", "user")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(401, "User not found")
        user_id = str(user["_id"])
        access = create_access_token(user_id, user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")


# ========== TASK ROUTES ==========
@api_router.post("/tasks")
async def create_task(req: TaskCreate, request: Request):
    user = await get_current_user(request)
    if not req.deadline:
        req.deadline = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d")
    task_doc = {
        "user_id": user["id"],
        "text": req.text,
        "priority": req.priority,
        "complexity": req.complexity,
        "deadline": req.deadline,
        "category": req.category,
        "parent_id": req.parent_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    energy = user.get("energy_level", 5)
    task_doc["score"] = calculate_task_score(task_doc, energy)
    task_doc["is_optimal"] = abs(energy - req.complexity) <= 2
    result = await db.tasks.insert_one(task_doc)
    task_doc["id"] = str(result.inserted_id)
    task_doc.pop("_id", None)
    return task_doc


@api_router.get("/tasks")
async def get_tasks(request: Request):
    user = await get_current_user(request)
    energy = user.get("energy_level", 5)
    tasks = await db.tasks.find(
        {"user_id": user["id"], "status": "active"}
    ).to_list(500)
    result = []
    for t in tasks:
        t["id"] = str(t.pop("_id"))
        t["score"] = calculate_task_score(t, energy)
        t["is_optimal"] = abs(energy - t.get("complexity", 5)) <= 2
        t.pop("user_id", None)
        result.append(t)
    result.sort(key=lambda x: x["score"], reverse=True)
    return result


@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, req: TaskUpdate, request: Request):
    user = await get_current_user(request)
    update = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "No fields to update")
    await db.tasks.update_one(
        {"_id": ObjectId(task_id), "user_id": user["id"]},
        {"$set": update}
    )
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(404, "Task not found")
    task["id"] = str(task.pop("_id"))
    task.pop("user_id", None)
    return task


@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.tasks.delete_one({"_id": ObjectId(task_id), "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(404, "Task not found")
    return {"message": "Task deleted"}


@api_router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, request: Request):
    user = await get_current_user(request)
    task = await db.tasks.find_one({"_id": ObjectId(task_id), "user_id": user["id"]})
    if not task:
        raise HTTPException(404, "Task not found")
    now = datetime.now(timezone.utc)
    await db.completions.insert_one({
        "user_id": user["id"],
        "task_id": task_id,
        "category": task.get("category", "General"),
        "priority": task.get("priority", 2),
        "complexity": task.get("complexity", 5),
        "completed_at": now.isoformat(),
        "hour": now.hour,
        "day_of_week": now.weekday()
    })
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": "completed", "completed_at": now.isoformat()}}
    )
    telem = await db.telemetry.find_one({"user_id": user["id"]})
    if telem:
        total = telem.get("total_completed", 0) + 1
        velocity = min(100, telem.get("velocity_score", 50) + task.get("priority", 2) * 1.5)
        streak = telem.get("streak", 0)
        last_date = telem.get("streak_last_date", "")
        today = now.strftime("%Y-%m-%d")
        yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        if last_date == today:
            pass
        elif last_date == yesterday or last_date == "":
            streak += 1
        else:
            streak = 1
        energy = user.get("energy_level", 5)
        is_match = abs(energy - task.get("complexity", 5)) <= 2
        old_rate = telem.get("cognitive_match_rate", 50)
        new_rate = old_rate * 0.9 + (100 if is_match else 0) * 0.1
        await db.telemetry.update_one(
            {"user_id": user["id"]},
            {"$set": {
                "total_completed": total,
                "velocity_score": round(velocity, 1),
                "streak": streak,
                "streak_last_date": today,
                "cognitive_match_rate": round(new_rate, 1),
                "updated_at": now.isoformat()
            }}
        )
    return {"message": "Task completed", "task_id": task_id}


# ========== TELEMETRY ==========
@api_router.get("/telemetry")
async def get_telemetry(request: Request):
    user = await get_current_user(request)
    telem = await db.telemetry.find_one({"user_id": user["id"]}, {"_id": 0, "user_id": 0})
    if not telem:
        return {"velocity_score": 50.0, "streak": 0, "cognitive_match_rate": 50.0, "total_completed": 0}
    return telem


@api_router.get("/telemetry/peak-hours")
async def get_peak_hours(request: Request):
    user = await get_current_user(request)
    completions = await db.completions.find(
        {"user_id": user["id"]}, {"_id": 0, "hour": 1}
    ).to_list(1000)
    hours = {}
    for c in completions:
        h = c.get("hour", 0)
        hours[h] = hours.get(h, 0) + 1
    peak_hour = max(hours, key=hours.get) if hours else 9
    return {"peak_hour": peak_hour, "hour_distribution": hours, "total": len(completions)}


@api_router.get("/telemetry/categories")
async def get_category_velocity(request: Request):
    user = await get_current_user(request)
    return await _get_category_velocity_data(user["id"])


async def _get_category_velocity_data(user_id: str):
    completions = await db.completions.find(
        {"user_id": user_id}, {"_id": 0, "category": 1}
    ).to_list(1000)
    active_tasks = await db.tasks.find(
        {"user_id": user_id, "status": "active"}, {"_id": 0, "category": 1}
    ).to_list(500)
    categories = {}
    for c in completions:
        cat = c.get("category", "General")
        categories.setdefault(cat, {"completed": 0, "active": 0})
        categories[cat]["completed"] += 1
    for t in active_tasks:
        cat = t.get("category", "General")
        categories.setdefault(cat, {"completed": 0, "active": 0})
        categories[cat]["active"] += 1
    result = []
    for cat, data in categories.items():
        total = data["completed"] + data["active"]
        velocity = (data["completed"] / total * 100) if total > 0 else 0
        result.append({
            "category": cat,
            "completed": data["completed"],
            "active": data["active"],
            "velocity": round(velocity, 1),
            "needs_delegation": velocity < 30 and data["active"] >= 3
        })
    return result


# ========== ENERGY ==========
@api_router.put("/user/energy")
async def update_energy(req: EnergyUpdate, request: Request):
    user = await get_current_user(request)
    await db.users.update_one(
        {"_id": ObjectId(user["id"])},
        {"$set": {"energy_level": req.energy_level}}
    )
    return {"energy_level": req.energy_level}


# ========== AI INSIGHTS ==========
@api_router.post("/ai/insights")
async def get_ai_insights(request: Request):
    user = await get_current_user(request)
    tasks = await db.tasks.find(
        {"user_id": user["id"], "status": "active"},
        {"_id": 0, "text": 1, "priority": 1, "complexity": 1, "deadline": 1, "category": 1, "score": 1}
    ).to_list(50)
    telem = await db.telemetry.find_one({"user_id": user["id"]}, {"_id": 0})
    completions = await db.completions.find(
        {"user_id": user["id"]},
        {"_id": 0, "hour": 1, "category": 1, "priority": 1}
    ).sort("completed_at", -1).to_list(20)
    cat_data = await _get_category_velocity_data(user["id"])
    energy = user.get("energy_level", 5)
    priority_labels = {1: "Low", 2: "Medium", 3: "High"}

    task_lines = "\n".join([
        f"- [{priority_labels.get(t['priority'], 'Med')}] {t['text']} (Complexity: {t['complexity']}/10, Due: {t['deadline']}, Category: {t['category']})"
        for t in tasks[:10]
    ])
    completion_lines = "\n".join([
        f"- Hour: {c['hour']}:00, Category: {c['category']}, Priority: {priority_labels.get(c['priority'], 'Med')}"
        for c in completions[:10]
    ])
    delegation_lines = "\n".join([
        f"- {c['category']}: {c['velocity']}% velocity, {c['active']} active tasks (NEEDS DELEGATION)"
        for c in cat_data if c.get("needs_delegation")
    ]) or "None flagged"

    prompt = f"""You are a productivity AI analyzing a user's cognitive task engine. Be concise and actionable.

Current State:
- Energy Level: {energy}/10
- Velocity Score: {telem.get('velocity_score', 50) if telem else 50}
- Deep Work Streak: {telem.get('streak', 0) if telem else 0} days
- Cognitive Match Rate: {telem.get('cognitive_match_rate', 50) if telem else 50}%

Active Tasks ({len(tasks)}):
{task_lines or "No active tasks"}

Recent Completions:
{completion_lines or "No recent completions"}

Categories Flagged for Delegation:
{delegation_lines}

Provide exactly 3 sections:
1. TOP RECOMMENDATIONS: 3 actionable items for right now based on energy level and task priorities
2. DELEGATION ALERT: Which task category should be delegated/automated (or "none" if all categories are healthy)
3. PATTERN INSIGHT: One insight about productivity patterns

Keep each point to 1-2 sentences. Direct, professional tone."""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        llm_key = os.environ.get("EMERGENT_LLM_KEY")
        if not llm_key:
            return {"insights": "AI insights require an API key. Configure EMERGENT_LLM_KEY.", "type": "error"}
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"velocity-{user['id']}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}",
            system_message="You are a productivity optimization AI. Be concise, direct, and actionable."
        ).with_model("openai", "gpt-4.1-mini")
        ai_response = await chat.send_message(UserMessage(text=prompt))
        return {"insights": ai_response, "type": "success", "generated_at": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        logger.error(f"AI insight error: {e}")
        return {"insights": f"Unable to generate AI insights: {str(e)}", "type": "error"}


# ========== CALENDAR STATUS ==========
@api_router.get("/calendar/status")
async def calendar_status(request: Request):
    user = await get_current_user(request)
    has_client_id = bool(os.environ.get("GOOGLE_CLIENT_ID"))
    has_tokens = False
    if has_client_id:
        user_doc = await db.users.find_one({"_id": ObjectId(user["id"])})
        has_tokens = bool(user_doc and user_doc.get("google_tokens"))
    return {
        "configured": has_client_id,
        "connected": has_tokens,
        "message": "Google Calendar credentials not configured" if not has_client_id else ("Connected" if has_tokens else "Not connected")
    }


@api_router.get("/categories")
async def get_categories():
    return CATEGORIES


# ========== STARTUP ==========
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.tasks.create_index([("user_id", 1), ("status", 1)])
    await db.completions.create_index([("user_id", 1), ("completed_at", -1)])
    await db.telemetry.create_index("user_id", unique=True)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        result = await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "energy_level": 5,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        user_id = str(result.inserted_id)
        await db.telemetry.insert_one({
            "user_id": user_id,
            "velocity_score": 50.0,
            "streak": 0,
            "streak_last_date": "",
            "cognitive_match_rate": 50.0,
            "total_completed": 0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )

    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n")
    logger.info("Velocity-One server started successfully")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
