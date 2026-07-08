from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- Config ----------
JWT_ALGO = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
ADMIN_NAME = os.environ.get("ADMIN_NAME", "Admin")
WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER", "+5573981891863")

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("your-statistics")

app = FastAPI(title="Your-Statistics API")
api = APIRouter(prefix="/api")


# ---------- Helpers ----------
def now_utc():
    return datetime.now(timezone.utc)

def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": now_utc() + timedelta(days=7), "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u["name"],
        "company": u.get("company", ""),
        "phone": u.get("phone", ""),
        "whatsapp": u.get("whatsapp", ""),
        "city": u.get("city", ""),
        "state": u.get("state", ""),
        "business_type": u.get("business_type", ""),
        "employees_count": u.get("employees_count", ""),
        "role": u.get("role", "user"),
        "status": u.get("status", "pendente"),
        "tenant_id": u.get("tenant_id"),
        "created_at": u.get("created_at"),
        "last_login": u.get("last_login"),
        "notes": u.get("notes", ""),
    }


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return user


async def require_approved(user: dict = Depends(get_current_user)) -> dict:
    if user.get("status") != "aprovado" and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Sua conta ainda não foi aprovada.")
    return user


# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    company: str
    phone: str = ""
    whatsapp: str = ""
    city: str = ""
    state: str = ""
    email: EmailStr
    password: str = Field(min_length=6)
    business_type: str = ""
    employees_count: str = ""

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TransactionIn(BaseModel):
    type: str  # 'receita' | 'despesa'
    amount: float
    description: str
    category: str = "Geral"
    date: Optional[str] = None  # ISO date
    payment_method: str = ""
    status: str = "pago"  # 'pago' | 'pendente'

class UserUpdateIn(BaseModel):
    notes: Optional[str] = None


# ---------- Auth endpoints ----------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    user_id = str(uuid.uuid4())
    tenant_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "tenant_id": tenant_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "company": payload.company.strip(),
        "phone": payload.phone.strip(),
        "whatsapp": payload.whatsapp.strip(),
        "city": payload.city.strip(),
        "state": payload.state.strip(),
        "business_type": payload.business_type,
        "employees_count": payload.employees_count,
        "role": "user",
        "status": "pendente",
        "notes": "",
        "created_at": iso(now_utc()),
        "last_login": None,
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, "user")
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=7*24*3600, path="/")
    return {"token": token, "user": public_user(doc)}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    if user.get("status") == "suspenso":
        raise HTTPException(status_code=403, detail="Sua conta foi suspensa. Entre em contato pelo WhatsApp.")
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": iso(now_utc())}})
    user["last_login"] = iso(now_utc())
    token = create_access_token(user["id"], user["email"], user.get("role", "user"))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=7*24*3600, path="/")
    return {"token": token, "user": public_user(user)}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}


# ---------- Public config ----------
@api.get("/config/public")
async def public_config():
    return {"whatsapp": WHATSAPP_NUMBER, "app_name": "Your-Statistics"}


# ---------- Admin (Master Panel) ----------
@api.get("/admin/users")
async def admin_list_users(admin: dict = Depends(require_admin), q: str = "", status: str = ""):
    query = {}
    if status:
        query["status"] = status
    if q:
        query["$or"] = [
            {"email": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}},
            {"company": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return {"users": docs, "counts": {
        "total": await db.users.count_documents({}),
        "pendente": await db.users.count_documents({"status": "pendente"}),
        "aprovado": await db.users.count_documents({"status": "aprovado"}),
        "suspenso": await db.users.count_documents({"status": "suspenso"}),
    }}


async def _set_status(user_id: str, status: str):
    res = await db.users.update_one({"id": user_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"ok": True, "status": status}


@api.post("/admin/users/{user_id}/approve")
async def admin_approve(user_id: str, admin: dict = Depends(require_admin)):
    return await _set_status(user_id, "aprovado")

@api.post("/admin/users/{user_id}/suspend")
async def admin_suspend(user_id: str, admin: dict = Depends(require_admin)):
    return await _set_status(user_id, "suspenso")

@api.post("/admin/users/{user_id}/reactivate")
async def admin_reactivate(user_id: str, admin: dict = Depends(require_admin)):
    return await _set_status(user_id, "aprovado")

@api.delete("/admin/users/{user_id}")
async def admin_delete(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Você não pode excluir sua própria conta.")
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    await db.users.delete_one({"id": user_id})
    if target.get("tenant_id"):
        await db.transactions.delete_many({"tenant_id": target["tenant_id"]})
    return {"ok": True}

@api.patch("/admin/users/{user_id}")
async def admin_update(user_id: str, payload: UserUpdateIn, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not update:
        return {"ok": True}
    await db.users.update_one({"id": user_id}, {"$set": update})
    return {"ok": True}


# ---------- Finance (tenant scoped) ----------
DEFAULT_CATEGORIES = {
    "receita": ["Vendas", "Serviços", "Comissões", "Outros"],
    "despesa": ["Fornecedores", "Aluguel", "Salários", "Contas Fixas", "Marketing", "Impostos", "Outros"],
}


@api.get("/finance/categories")
async def finance_categories(user: dict = Depends(require_approved)):
    return DEFAULT_CATEGORIES


@api.get("/finance/transactions")
async def list_transactions(user: dict = Depends(require_approved), type: str = "", limit: int = 200):
    query = {"tenant_id": user["tenant_id"]}
    if type in ("receita", "despesa"):
        query["type"] = type
    docs = await db.transactions.find(query, {"_id": 0}).sort("date", -1).to_list(limit)
    return {"transactions": docs}


@api.post("/finance/transactions")
async def create_transaction(payload: TransactionIn, user: dict = Depends(require_approved)):
    if payload.type not in ("receita", "despesa"):
        raise HTTPException(status_code=400, detail="Tipo inválido")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Valor deve ser positivo")
    # Normalize date to tz-aware ISO string
    if payload.date:
        try:
            if len(payload.date) == 10:
                normalized_date = datetime.fromisoformat(payload.date).replace(tzinfo=timezone.utc)
            else:
                nd = datetime.fromisoformat(payload.date.replace("Z", "+00:00"))
                normalized_date = nd if nd.tzinfo else nd.replace(tzinfo=timezone.utc)
            date_iso = iso(normalized_date)
        except Exception:
            date_iso = iso(now_utc())
    else:
        date_iso = iso(now_utc())
    doc = {
        "id": str(uuid.uuid4()),
        "tenant_id": user["tenant_id"],
        "user_id": user["id"],
        "type": payload.type,
        "amount": float(payload.amount),
        "description": payload.description.strip(),
        "category": payload.category or "Geral",
        "payment_method": payload.payment_method,
        "status": payload.status,
        "date": date_iso,
        "created_at": iso(now_utc()),
    }
    await db.transactions.insert_one(doc)
    doc.pop("_id", None)
    return {"transaction": doc}


@api.delete("/finance/transactions/{tx_id}")
async def delete_transaction(tx_id: str, user: dict = Depends(require_approved)):
    res = await db.transactions.delete_one({"id": tx_id, "tenant_id": user["tenant_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    return {"ok": True}


@api.get("/finance/dashboard")
async def finance_dashboard(user: dict = Depends(require_approved)):
    tenant_id = user["tenant_id"]
    now = now_utc()
    today = now.date().isoformat()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    txs = await db.transactions.find({"tenant_id": tenant_id}, {"_id": 0}).to_list(5000)

    revenue_today = 0.0
    revenue_month = 0.0
    expense_month = 0.0
    balance = 0.0
    pending_bills = 0
    monthly = {}   # 'YYYY-MM' -> {rev,exp}
    weekly = {}    # last 7 days
    for tx in txs:
        raw_date = tx.get("date", "")
        try:
            if len(raw_date) == 10:  # 'YYYY-MM-DD' from FE
                d = datetime.fromisoformat(raw_date).replace(tzinfo=timezone.utc)
            else:
                d = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
                if d.tzinfo is None:
                    d = d.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        amt = float(tx.get("amount", 0))
        is_rev = tx["type"] == "receita"
        if is_rev:
            balance += amt
        else:
            balance -= amt
        if d.date().isoformat() == today and is_rev:
            revenue_today += amt
        if d >= month_start:
            if is_rev:
                revenue_month += amt
            else:
                expense_month += amt
        key = d.strftime("%Y-%m")
        monthly.setdefault(key, {"receita": 0, "despesa": 0})
        monthly[key]["receita" if is_rev else "despesa"] += amt
        days_ago = (now.date() - d.date()).days
        if 0 <= days_ago < 7:
            wkey = d.date().isoformat()
            weekly.setdefault(wkey, {"receita": 0, "despesa": 0})
            weekly[wkey]["receita" if is_rev else "despesa"] += amt
        if tx.get("status") == "pendente":
            pending_bills += 1

    monthly_series = [
        {"month": k, "receita": round(v["receita"], 2), "despesa": round(v["despesa"], 2)}
        for k, v in sorted(monthly.items())
    ]
    weekly_series = []
    for i in range(6, -1, -1):
        day = (now.date() - timedelta(days=i)).isoformat()
        v = weekly.get(day, {"receita": 0, "despesa": 0})
        weekly_series.append({"day": day, "receita": round(v["receita"], 2), "despesa": round(v["despesa"], 2)})

    txs_sorted = sorted(txs, key=lambda t: t.get("date", ""), reverse=True)
    return {
        "kpis": {
            "revenue_today": round(revenue_today, 2),
            "revenue_month": round(revenue_month, 2),
            "expense_month": round(expense_month, 2),
            "profit_month": round(revenue_month - expense_month, 2),
            "balance": round(balance, 2),
            "pending_bills": pending_bills,
            "transactions_count": len(txs),
        },
        "monthly": monthly_series,
        "weekly": weekly_series,
        "recent": txs_sorted[:8],
    }


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("tenant_id")
    await db.transactions.create_index("tenant_id")
    await db.transactions.create_index([("tenant_id", 1), ("date", -1)])

    # Seed Admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id,
            "tenant_id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": ADMIN_NAME,
            "company": "Your-Statistics",
            "phone": "", "whatsapp": WHATSAPP_NUMBER,
            "city": "Ilhéus", "state": "BA",
            "business_type": "SaaS", "employees_count": "1-5",
            "role": "admin", "status": "aprovado", "notes": "",
            "created_at": iso(now_utc()), "last_login": None,
        })
        logger.info(f"Admin seeded: {ADMIN_EMAIL}")
    else:
        # keep password in sync with .env
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {
                "password_hash": hash_password(ADMIN_PASSWORD),
                "role": "admin", "status": "aprovado",
            }})
            logger.info("Admin password refreshed from .env")

    # Seed demo approved user + demo transactions
    demo_email = "demo@yourstatistics.com"
    demo = await db.users.find_one({"email": demo_email})
    if not demo:
        demo_id = str(uuid.uuid4())
        demo_tenant = str(uuid.uuid4())
        await db.users.insert_one({
            "id": demo_id, "tenant_id": demo_tenant,
            "email": demo_email, "password_hash": hash_password("Demo@2026!"),
            "name": "Cliente Demo", "company": "Empresa Demo LTDA",
            "phone": "+55 11 99999-0000", "whatsapp": "+55 11 99999-0000",
            "city": "São Paulo", "state": "SP",
            "business_type": "Loja", "employees_count": "1-5",
            "role": "user", "status": "aprovado", "notes": "",
            "created_at": iso(now_utc()), "last_login": None,
        })

    # Seed pending user
    pend_email = "pendente@yourstatistics.com"
    if not await db.users.find_one({"email": pend_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "tenant_id": str(uuid.uuid4()),
            "email": pend_email, "password_hash": hash_password("Pendente@2026!"),
            "name": "Usuário Pendente", "company": "Aguardando Demo",
            "phone": "", "whatsapp": "", "city": "Rio de Janeiro", "state": "RJ",
            "business_type": "Restaurante", "employees_count": "6-20",
            "role": "user", "status": "pendente", "notes": "",
            "created_at": iso(now_utc()), "last_login": None,
        })


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
