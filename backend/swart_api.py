#!/usr/bin/env python3
import json
import os
import sqlite3
import time
import uuid
from datetime import date, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen


BASE_DIR = os.environ.get("SWART_BASE_DIR", "/opt/swart-core")
DB_PATH = os.environ.get("SWART_DB_PATH", os.path.join(BASE_DIR, "data", "swart.sqlite3"))
HOST = os.environ.get("SWART_HOST", "127.0.0.1")
PORT = int(os.environ.get("SWART_PORT", "3107"))
MAX_PER_SLOT = int(os.environ.get("SWART_MAX_PER_SLOT", "4"))
WECHAT_APPID = os.environ.get("WECHAT_APPID", "")
WECHAT_APP_SECRET = os.environ.get("WECHAT_APP_SECRET", "")

SERVICES = [
    {
        "id": "combo",
        "name": "清灰换脂",
        "price": 50,
        "desc": "拆机清灰 + 散热硅脂更换，适合温度高、风扇响、性能下降。",
        "tags": ["推荐", "性能恢复", "散热优化"],
    },
    {
        "id": "clean",
        "name": "单清灰",
        "price": 30,
        "desc": "风扇、散热鳍片、机身缝隙清洁，适合日常维护。",
        "tags": ["基础维护", "灰尘清理"],
    },
]

ADDONS = [
    {"id": "screen", "name": "屏幕清洁", "oldPrice": 8, "price": 0, "free": True},
    {"id": "keyboard", "name": "键盘清洁", "oldPrice": 6, "price": 0, "free": True},
    {"id": "ports", "name": "接口除尘", "oldPrice": 5, "price": 0, "free": True},
    {"id": "shell", "name": "外壳清理", "oldPrice": 5, "price": 0, "free": True},
    {"id": "system", "name": "系统优化", "price": 10},
    {"id": "benchmark", "name": "跑分测试", "price": 5},
]

SLOTS = [
    {"id": "noon", "time": "12:00 - 15:00", "copy": "午间取送，适合上午下课后交接"},
    {"id": "afternoon", "time": "15:00 - 18:00", "copy": "下午维护，晚饭前后可取回"},
    {"id": "night", "time": "18:00 - 21:00", "copy": "晚间服务，适合白天有课同学"},
]

MODEL_MAP = {
    "联想": ["拯救者 Y7000P", "拯救者 R7000P", "小新 Pro 14", "ThinkBook 14+", "ThinkPad E14"],
    "华硕": ["天选 4", "天选 5 Pro", "ROG 魔霸", "无畏 Pro 15", "灵耀 14"],
    "戴尔": ["游匣 G15", "灵越 14 Plus", "XPS 13", "成就 Vostro", "外星人 m16"],
    "惠普": ["暗影精灵 9", "暗影精灵 10", "战 66", "星 Book Pro", "ENVY 13"],
    "苹果": ["MacBook Air M1", "MacBook Air M2", "MacBook Pro 13", "MacBook Pro 14", "MacBook Pro 16"],
    "华为": ["MateBook 14", "MateBook D 14", "MateBook X Pro", "MateBook 16s"],
    "小米": ["RedmiBook Pro 14", "RedmiBook Pro 15", "小米笔记本 Pro", "Redmi G"],
    "机械革命": ["极光 Pro", "蛟龙 16", "旷世 16", "无界 14 Pro"],
    "神舟": ["战神 Z7", "战神 Z8", "优雅 X5", "战神 TX9"],
    "其他": ["不确定型号", "台式机主机", "一体机", "其他笔记本"],
}


def connect_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with connect_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_no TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL DEFAULT '待确认',
                service_id TEXT NOT NULL,
                service_name TEXT NOT NULL,
                service_price INTEGER NOT NULL,
                appointment_date TEXT NOT NULL,
                slot_id TEXT NOT NULL,
                slot_time TEXT NOT NULL,
                device_brand TEXT,
                device_model TEXT,
                device_note TEXT,
                dorm TEXT NOT NULL,
                contact_name TEXT,
                contact_phone TEXT NOT NULL,
                address_note TEXT,
                payload TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
            """
        )
        ensure_column(conn, "orders", "user_id", "TEXT")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_slot ON orders(appointment_date, slot_id, status)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(contact_phone, created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at)")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL UNIQUE,
                openid TEXT UNIQUE,
                phone TEXT,
                nick_name TEXT,
                avatar_url TEXT,
                payload TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
            """
        )
        ensure_column(conn, "users", "points", "INTEGER NOT NULL DEFAULT 0")
        ensure_column(conn, "users", "member_level", "TEXT NOT NULL DEFAULT 'IT小白'")
        ensure_column(conn, "users", "cards_count", "INTEGER NOT NULL DEFAULT 0")
        ensure_column(conn, "users", "coupons_count", "INTEGER NOT NULL DEFAULT 0")
        ensure_column(conn, "users", "total_spent", "INTEGER NOT NULL DEFAULT 0")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)")


def ensure_column(conn, table, column, ddl):
    existing = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in existing:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def route_path(raw_path):
    path = urlparse(raw_path).path.rstrip("/") or "/"
    if path.startswith("/swart-api"):
        path = path[len("/swart-api") :] or "/"
    return path


def parse_body(handler):
    length = int(handler.headers.get("Content-Length") or 0)
    if not length:
        return {}
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


def http_json(url, payload=None):
    if payload is None:
        with urlopen(url, timeout=8) as response:
            return json.loads(response.read().decode("utf-8"))
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=8) as response:
        return json.loads(response.read().decode("utf-8"))


def wechat_session(login_code):
    if not (WECHAT_APPID and WECHAT_APP_SECRET and login_code):
        return {}
    url = (
        "https://api.weixin.qq.com/sns/jscode2session"
        f"?appid={WECHAT_APPID}&secret={WECHAT_APP_SECRET}&js_code={login_code}&grant_type=authorization_code"
    )
    data = http_json(url)
    if data.get("errcode"):
        raise RuntimeError(data.get("errmsg") or "jscode2session failed")
    return data


def wechat_access_token():
    if not (WECHAT_APPID and WECHAT_APP_SECRET):
        return ""
    url = (
        "https://api.weixin.qq.com/cgi-bin/token"
        f"?grant_type=client_credential&appid={WECHAT_APPID}&secret={WECHAT_APP_SECRET}"
    )
    data = http_json(url)
    if data.get("errcode"):
        raise RuntimeError(data.get("errmsg") or "access_token failed")
    return data.get("access_token") or ""


def wechat_phone(phone_code):
    if not (WECHAT_APPID and WECHAT_APP_SECRET and phone_code):
        return ""
    token = wechat_access_token()
    data = http_json(
        f"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token={token}",
        {"code": phone_code},
    )
    if data.get("errcode"):
        raise RuntimeError(data.get("errmsg") or "get phone failed")
    phone_info = data.get("phone_info") or {}
    return phone_info.get("purePhoneNumber") or phone_info.get("phoneNumber") or ""


def calculate_member_level(points):
    points = int(points or 0)
    if points < 1000:
        return {
            "name": "IT小白",
            "percent": round(points / 1000 * 100, 2),
            "nextName": "入门IT",
            "needPoints": 1000 - points,
        }
    if points < 5000:
        return {
            "name": "入门IT",
            "percent": round((points - 1000) / 4000 * 100, 2),
            "nextName": "IT Goal",
            "needPoints": 5000 - points,
        }
    return {
        "name": "IT Goal",
        "percent": 100,
        "nextName": "MAX",
        "needPoints": 0,
    }


def user_payload(row):
    if not row:
        return None
    points = int(row["points"] or 0)
    level_info = calculate_member_level(points)
    return {
        "userId": row["user_id"],
        "openid": row["openid"] or "",
        "phone": row["phone"] or "",
        "nickName": row["nick_name"] or "三物用户",
        "avatarUrl": row["avatar_url"] or "",
        "points": points,
        "memberLevel": row["member_level"] or level_info["name"],
        "levelInfo": level_info,
        "cardsCount": int(row["cards_count"] or 0),
        "couponsCount": int(row["coupons_count"] or 0),
        "totalSpent": int(row["total_spent"] or 0),
        "registeredAt": int(row["created_at"] or 0),
        "updatedAt": int(row["updated_at"] or 0),
    }


def fetch_user(user_id):
    if not user_id:
        return None
    with connect_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    return user_payload(row)


def fetch_user_orders(user_id, phone=""):
    if not user_id and not phone:
        return []
    params = []
    filters = []
    if user_id:
        filters.append("user_id = ?")
        params.append(user_id)
    if phone:
        filters.append("contact_phone = ?")
        params.append(phone)
    with connect_db() as conn:
        rows = conn.execute(
            f"""
            SELECT payload, status, order_no, created_at
            FROM orders
            WHERE {' OR '.join(filters)}
            ORDER BY created_at DESC
            LIMIT 20
            """,
            tuple(params),
        ).fetchall()
    orders = []
    for row in rows:
        item = json.loads(row["payload"])
        item["status"] = row["status"]
        item["orderNo"] = row["order_no"]
        item["createdAt"] = row["created_at"]
        orders.append(item)
    return orders


def award_points(conn, user_id, amount):
    if not user_id:
        return None
    row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    if not row:
        return None
    earned = int(round(float(amount or 0) * 10))
    points = int(row["points"] or 0) + earned
    total_spent = int(row["total_spent"] or 0) + int(amount or 0)
    level = calculate_member_level(points)["name"]
    now = int(time.time())
    conn.execute(
        """
        UPDATE users
        SET points = ?, member_level = ?, total_spent = ?, updated_at = ?
        WHERE user_id = ?
        """,
        (points, level, total_spent, now, user_id),
    )
    updated = dict(row)
    updated["points"] = points
    updated["member_level"] = level
    updated["total_spent"] = total_spent
    updated["updated_at"] = now
    return user_payload(updated)


def service_by_id(service_id):
    return next((item for item in SERVICES if item["id"] == service_id), None)


def slot_by_id(slot_id):
    return next((item for item in SLOTS if item["id"] == slot_id), None)


def slot_counts(appointment_date):
    with connect_db() as conn:
        rows = conn.execute(
            """
            SELECT slot_id, COUNT(*) AS total
            FROM orders
            WHERE appointment_date = ? AND status != '已取消'
            GROUP BY slot_id
            """,
            (appointment_date,),
        ).fetchall()
    return {row["slot_id"]: row["total"] for row in rows}


def make_slots(appointment_date):
    counts = slot_counts(appointment_date)
    return [
        {
            **slot,
            "capacity": MAX_PER_SLOT,
            "booked": counts.get(slot["id"], 0),
            "remaining": max(0, MAX_PER_SLOT - counts.get(slot["id"], 0)),
        }
        for slot in SLOTS
    ]


def create_order(payload):
    service = payload.get("service") or {}
    schedule = payload.get("schedule") or {}
    device = payload.get("device") or {}
    dorm = payload.get("dorm") or {}
    user = payload.get("user") or {}
    user_id = payload.get("userId") or user.get("userId") or ""
    selected_addons = payload.get("addons") or []
    grease = payload.get("grease")

    service_data = service_by_id(service.get("id") or service.get("service_id"))
    slot_data = slot_by_id(schedule.get("slotId") or schedule.get("slot_id"))
    appointment_date = schedule.get("dateValue") or schedule.get("appointment_date")
    contact_phone = dorm.get("contactPhone") or dorm.get("contact_phone")
    dorm_name = dorm.get("dorm")

    if not service_data:
        return 400, {"ok": False, "message": "服务项目无效"}
    if not slot_data:
        return 400, {"ok": False, "message": "预约时间段无效"}
    if not appointment_date:
        return 400, {"ok": False, "message": "预约日期不能为空"}
    if not dorm_name:
        return 400, {"ok": False, "message": "宿舍楼不能为空"}
    if not contact_phone:
        return 400, {"ok": False, "message": "联系方式不能为空"}

    booked = slot_counts(appointment_date).get(slot_data["id"], 0)
    if booked >= MAX_PER_SLOT:
        return 409, {"ok": False, "message": "该时间段已约满，请选择其他时间"}

    base_price = int(service_data["price"])
    addons_price = sum(int(item.get("price") or 0) for item in selected_addons)
    grease_price = int((grease or {}).get("price") or 0) if service_data["id"] == "combo" else 0
    requested_total = int(payload.get("totalPrice") or service.get("totalPrice") or 0)
    total_price = max(base_price + addons_price + grease_price, requested_total, base_price)

    order_no = f"SW{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"
    now = int(time.time())
    normalized = {
        "service": {**service_data, "totalPrice": total_price},
        "addons": selected_addons,
        "grease": grease if service_data["id"] == "combo" else None,
        "totalPrice": total_price,
        "schedule": {
            "dateValue": appointment_date,
            "dateText": schedule.get("dateText") or appointment_date,
            "slotId": slot_data["id"],
            "slotTime": slot_data["time"],
        },
        "device": device,
        "dorm": dorm,
        "user": {"userId": user_id},
    }

    updated_user = None
    with connect_db() as conn:
        conn.execute(
            """
            INSERT INTO orders (
                user_id,
                order_no, status, service_id, service_name, service_price,
                appointment_date, slot_id, slot_time,
                device_brand, device_model, device_note,
                dorm, contact_name, contact_phone, address_note,
                payload, created_at
            )
            VALUES (?, ?, '待确认', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id or None,
                order_no,
                service_data["id"],
                service_data["name"],
                total_price,
                appointment_date,
                slot_data["id"],
                slot_data["time"],
                device.get("brand"),
                device.get("finalModel") or device.get("model"),
                device.get("note"),
                dorm_name,
                dorm.get("contactName"),
                contact_phone,
                dorm.get("addressNote"),
                json.dumps(normalized, ensure_ascii=False),
                now,
            ),
        )
        updated_user = award_points(conn, user_id, total_price)
    return 201, {
        "ok": True,
        "orderNo": order_no,
        "order": {**normalized, "status": "待确认", "createdAt": now},
        "awardedPoints": total_price * 10 if updated_user else 0,
        "user": updated_user,
    }


def login_user(payload):
    login_code = payload.get("loginCode") or ""
    phone_code = payload.get("phoneCode") or ""
    client_user_id = (payload.get("clientUserId") or "").strip()
    profile = payload.get("profile") or {}
    nick_name = (profile.get("nickName") or "三物用户").strip() or "三物用户"
    avatar_url = profile.get("avatarUrl") or ""
    now = int(time.time())

    openid = ""
    phone = ""
    try:
        session = wechat_session(login_code)
        openid = session.get("openid") or ""
        phone = wechat_phone(phone_code)
    except Exception as exc:
        print(f"wechat login fallback: {exc}", flush=True)

    user_id = openid or client_user_id or f"dev_{uuid.uuid4().hex[:16]}"

    with connect_db() as conn:
        existed = None
        if openid:
            existed = conn.execute("SELECT * FROM users WHERE openid = ?", (openid,)).fetchone()
        if not existed and client_user_id:
            existed = conn.execute("SELECT * FROM users WHERE user_id = ?", (client_user_id,)).fetchone()
        if not existed and phone:
            existed = conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
        if existed:
            user_id = existed["user_id"]
            conn.execute(
                """
                UPDATE users
                SET openid = COALESCE(?, openid),
                    phone = COALESCE(NULLIF(?, ''), phone),
                    nick_name = ?,
                    avatar_url = ?,
                    payload = ?,
                    updated_at = ?
                WHERE user_id = ?
                """,
                (
                    openid or None,
                    phone,
                    nick_name,
                    avatar_url,
                    json.dumps(payload, ensure_ascii=False),
                    now,
                    user_id,
                ),
            )
        else:
            conn.execute(
                """
                INSERT INTO users (
                    user_id, openid, phone, nick_name, avatar_url, payload,
                    points, member_level, cards_count, coupons_count, total_spent,
                    created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, 100, 'IT小白', 0, 1, 0, ?, ?)
                """,
                (
                    user_id,
                    openid or None,
                    phone,
                    nick_name,
                    avatar_url,
                    json.dumps(payload, ensure_ascii=False),
                    now,
                    now,
                ),
            )
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    return 200, {"ok": True, "user": user_payload(row)}


def get_user_center(query):
    user_id = (query.get("userId") or [""])[0]
    phone = (query.get("phone") or [""])[0]
    if not user_id and not phone:
        return 400, {"ok": False, "message": "userId 参数不能为空"}
    with connect_db() as conn:
        row = None
        if user_id:
            row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        if not row and phone:
            row = conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
    if not row:
        return 404, {"ok": False, "message": "用户不存在"}
    user = user_payload(row)
    return 200, {"ok": True, "user": user, "orders": fetch_user_orders(user["userId"], user["phone"])}


class Handler(BaseHTTPRequestHandler):
    server_version = "SwartCoreAPI/1.0"

    def do_OPTIONS(self):
        json_response(self, 204, {})

    def do_GET(self):
        path = route_path(self.path)
        query = parse_qs(urlparse(self.path).query)
        if path == "/health":
            json_response(self, 200, {"ok": True, "service": "swart-core-api", "time": int(time.time())})
            return
        if path == "/api/config":
            json_response(
                self,
                200,
                {
                    "ok": True,
                    "services": SERVICES,
                    "addons": ADDONS,
                    "slots": SLOTS,
                    "dorms": [f"{index}号楼" for index in range(1, 22)],
                    "brands": list(MODEL_MAP.keys()),
                    "modelMap": MODEL_MAP,
                },
            )
            return
        if path == "/api/slots":
            appointment_date = (query.get("date") or [date.today().isoformat()])[0]
            json_response(self, 200, {"ok": True, "date": appointment_date, "slots": make_slots(appointment_date)})
            return
        if path == "/api/users/me":
            status, response = get_user_center(query)
            json_response(self, status, response)
            return
        if path == "/api/orders":
            phone = (query.get("phone") or [""])[0]
            if not phone:
                json_response(self, 400, {"ok": False, "message": "phone 参数不能为空"})
                return
            with connect_db() as conn:
                rows = conn.execute(
                    """
                    SELECT payload, status, order_no, created_at
                    FROM orders
                    WHERE contact_phone = ?
                    ORDER BY created_at DESC
                    LIMIT 20
                    """,
                    (phone,),
                ).fetchall()
            orders = []
            for row in rows:
                item = json.loads(row["payload"])
                item["status"] = row["status"]
                item["orderNo"] = row["order_no"]
                item["createdAt"] = row["created_at"]
                orders.append(item)
            json_response(self, 200, {"ok": True, "orders": orders})
            return
        json_response(self, 404, {"ok": False, "message": "接口不存在"})

    def do_POST(self):
        path = route_path(self.path)
        try:
            payload = parse_body(self)
        except Exception:
            json_response(self, 400, {"ok": False, "message": "请求 JSON 格式错误"})
            return
        if path == "/api/orders":
            status, response = create_order(payload)
            json_response(self, status, response)
            return
        if path == "/api/users/login":
            status, response = login_user(payload)
            json_response(self, status, response)
            return
        json_response(self, 404, {"ok": False, "message": "接口不存在"})

    def log_message(self, fmt, *args):
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), fmt % args), flush=True)


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"SW.ART CORE API listening on {HOST}:{PORT}, db={DB_PATH}", flush=True)
    server.serve_forever()
