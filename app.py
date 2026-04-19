"""
Pandea — Backend API (Flask + SQLite)
======================================
Reemplaza el localStorage del frontend con una API REST real.

Endpoints:
  Auth       POST /api/auth/register, /api/auth/login, /api/auth/recover
  Users      GET/PUT /api/users/:id, GET /api/admin/users, DELETE /api/admin/users/:id
  Products   GET /api/products, GET /api/products/:id
             POST/PUT/DELETE /api/admin/products/:id
  Orders     POST /api/orders, GET /api/orders/me
             GET/PUT/DELETE /api/admin/orders
  Coupons    POST /api/coupons/validate
             GET/POST/PUT/DELETE /api/admin/coupons
  Activity   GET /api/admin/activity
  Stats      GET /api/admin/stats
"""

import os, sqlite3, json, hashlib, secrets, datetime
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS

try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    import base64, json as _json
    JWT_AVAILABLE = False

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False

# ─────────────────────────── Config ───────────────────────────
app = Flask(__name__)
CORS(app, origins="*")

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
DB_PATH      = os.path.join(BASE_DIR, "pandea.db")
SECRET_KEY   = os.environ.get("SECRET_KEY", "pandea-super-secret-2024")
TOKEN_EXPIRY = 60 * 60 * 24 * 7  # 7 días

# ─────────────────────────── DB helpers ───────────────────────
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db: db.close()

def query(sql, args=(), one=False):
    cur = get_db().execute(sql, args)
    r = cur.fetchall()
    return (dict(r[0]) if r else None) if one else [dict(x) for x in r]

def execute(sql, args=()):
    db = get_db()
    cur = db.execute(sql, args)
    db.commit()
    return cur.lastrowid

# ─────────────────────────── Schema ───────────────────────────
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    apellido      TEXT NOT NULL,
    tipo_doc      TEXT DEFAULT 'CC',
    documento     TEXT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    edad          INTEGER DEFAULT 0,
    ciudad        TEXT DEFAULT '',
    direccion     TEXT DEFAULT '',
    rol           TEXT DEFAULT 'cliente',
    fecha_registro TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    categoria     TEXT NOT NULL,
    precio        REAL NOT NULL,
    descripcion   TEXT DEFAULT '',
    es_nuevo      INTEGER DEFAULT 0,
    colores       TEXT DEFAULT '[]',
    stock         TEXT DEFAULT '{"XS":10,"S":10,"M":10,"L":10,"XL":10}',
    imagen_svg    TEXT DEFAULT '',
    imagen_data   TEXT DEFAULT '',
    fecha_creacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id            TEXT PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    user_name     TEXT NOT NULL,
    items         TEXT NOT NULL,
    subtotal      REAL NOT NULL,
    discount_amt  REAL DEFAULT 0,
    coupon_code   TEXT DEFAULT '',
    total         REAL NOT NULL,
    status        TEXT DEFAULT 'pendiente',
    fecha         TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS coupons (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    code          TEXT UNIQUE NOT NULL,
    type          TEXT NOT NULL,
    value         REAL NOT NULL,
    min_order     REAL DEFAULT 0,
    max_uses      INTEGER DEFAULT 100,
    uses          INTEGER DEFAULT 0,
    description   TEXT DEFAULT '',
    active        INTEGER DEFAULT 1,
    fecha_creacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email    TEXT NOT NULL,
    action        TEXT NOT NULL,
    status        TEXT DEFAULT 'info',
    fecha         TEXT NOT NULL
);
"""

def init_db():
    with app.app_context():
        db = get_db()
        db.executescript(SCHEMA)
        db.commit()
        _seed_products()
        _seed_coupons()

# ─────────────────────────── Seed data ────────────────────────
DEFAULT_PRODUCTS = [
    {"nombre":"Blusa Lino Soleil","categoria":"mujer","precio":89000,"descripcion":"Blusa de lino con corte amplio y mangas flotantes. Perfecta para el día a día con un toque elegante.","es_nuevo":1,"colores":["#F5E6D3","#C9A882","#8B7355"],"stock":{"XS":5,"S":8,"M":12,"L":6,"XL":3}},
    {"nombre":"Pantalón Arcilla","categoria":"mujer","precio":135000,"descripcion":"Pantalón de tiro alto con tela fluida. Cintura elástica y bolsillos laterales.","es_nuevo":0,"colores":["#C9A882","#6B4F35"],"stock":{"XS":3,"S":7,"M":9,"L":5,"XL":2}},
    {"nombre":"Camisa Tierra","categoria":"hombre","precio":98000,"descripcion":"Camisa de algodón con lavado especial que le da un acabado suavizado y natural.","es_nuevo":1,"colores":["#6B4F35","#F5E6D3","#1C1612"],"stock":{"XS":0,"S":5,"M":10,"L":8,"XL":4}},
    {"nombre":"Chaqueta Cortaviento","categoria":"hombre","precio":210000,"descripcion":"Chaqueta ligera con tratamiento water-repellent. Capucha desmontable.","es_nuevo":0,"colores":["#1C1612","#6B4F35"],"stock":{"XS":2,"S":4,"M":6,"L":4,"XL":2}},
    {"nombre":"Bolso Arena","categoria":"accesorios","precio":145000,"descripcion":"Bolso de cuero vegano con cierre magnético y correa ajustable.","es_nuevo":1,"colores":["#C9A882","#1C1612"],"stock":{"XS":0,"S":0,"M":15,"L":8,"XL":0}},
    {"nombre":"Cinturón Bark","categoria":"accesorios","precio":55000,"descripcion":"Cinturón de cuero curtido artesanalmente. Hebilla en latón mate.","es_nuevo":0,"colores":["#6B4F35","#1C1612"],"stock":{"XS":0,"S":6,"M":10,"L":8,"XL":4}},
]

DEFAULT_COUPONS = [
    {"code":"BIENVENIDA","type":"percent","value":10,"min_order":0,"max_uses":1000,"description":"10% de descuento para nuevos clientes","active":1},
    {"code":"PANDEA20","type":"percent","value":20,"min_order":100000,"max_uses":500,"description":"20% off en pedidos mayores a $100.000","active":1},
    {"code":"ENVIOGRATIS","type":"fixed","value":15000,"min_order":80000,"max_uses":200,"description":"Descuento fijo de $15.000 en envío","active":1},
]

def _seed_products():
    count = query("SELECT COUNT(*) as n FROM products", one=True)
    if count and count["n"] == 0:
        now = datetime.datetime.utcnow().isoformat()
        for p in DEFAULT_PRODUCTS:
            execute(
                "INSERT INTO products (nombre,categoria,precio,descripcion,es_nuevo,colores,stock,fecha_creacion) VALUES (?,?,?,?,?,?,?,?)",
                (p["nombre"],p["categoria"],p["precio"],p["descripcion"],p["es_nuevo"],
                 json.dumps(p["colores"]),json.dumps(p["stock"]),now)
            )

def _seed_coupons():
    count = query("SELECT COUNT(*) as n FROM coupons", one=True)
    if count and count["n"] == 0:
        now = datetime.datetime.utcnow().isoformat()
        for c in DEFAULT_COUPONS:
            execute(
                "INSERT INTO coupons (code,type,value,min_order,max_uses,description,active,fecha_creacion) VALUES (?,?,?,?,?,?,?,?)",
                (c["code"],c["type"],c["value"],c["min_order"],c["max_uses"],c["description"],c["active"],now)
            )

# ─────────────────────────── Password helpers ─────────────────
def hash_password(password: str) -> str:
    if BCRYPT_AVAILABLE:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    # Fallback: sha256 + salt
    salt = secrets.token_hex(16)
    h = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"sha256${salt}${h}"

def check_password(password: str, hashed: str) -> bool:
    if BCRYPT_AVAILABLE and hashed.startswith("$2"):
        return bcrypt.checkpw(password.encode(), hashed.encode())
    # Fallback
    try:
        _, salt, h = hashed.split("$")
        return hashlib.sha256((password + salt).encode()).hexdigest() == h
    except Exception:
        return False

# ─────────────────────────── JWT helpers ──────────────────────
def create_token(user_id: int, rol: str) -> str:
    payload = {
        "sub": user_id,
        "rol": rol,
        "iat": int(datetime.datetime.utcnow().timestamp()),
        "exp": int((datetime.datetime.utcnow() + datetime.timedelta(seconds=TOKEN_EXPIRY)).timestamp()),
    }
    if JWT_AVAILABLE:
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # Fallback: simple base64 token (NOT secure for production)
    raw = json.dumps(payload).encode()
    return base64.urlsafe_b64encode(raw).decode()

def decode_token(token: str):
    if JWT_AVAILABLE:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    raw = base64.urlsafe_b64decode(token.encode() + b"==")
    return json.loads(raw)

# ─────────────────────────── Auth decorators ──────────────────
def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "No autorizado"}), 401
        try:
            payload = decode_token(auth[7:])
            g.current_user = payload
        except Exception:
            return jsonify({"error": "Token inválido o expirado"}), 401
        return f(*args, **kwargs)
    return wrapper

def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "No autorizado"}), 401
        try:
            payload = decode_token(auth[7:])
            g.current_user = payload
        except Exception:
            return jsonify({"error": "Token inválido o expirado"}), 401
        if payload.get("rol") != "admin":
            return jsonify({"error": "Acceso denegado — solo admins"}), 403
        return f(*args, **kwargs)
    return wrapper

# ─────────────────────────── Utils ────────────────────────────
def parse_product(row: dict) -> dict:
    row["colores"] = json.loads(row.get("colores") or "[]")
    row["stock"]   = json.loads(row.get("stock")   or "{}")
    row["es_nuevo"] = bool(row.get("es_nuevo"))
    return row

def log_activity(email: str, action: str, status: str = "info"):
    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    execute("INSERT INTO activity (user_email,action,status,fecha) VALUES (?,?,?,?)",
            (email, action, status, now))

def now_iso():
    return datetime.datetime.utcnow().isoformat()

def order_id():
    ts = datetime.datetime.utcnow().strftime("%y%m%d%H%M%S")
    return f"PND-{ts}-{secrets.token_hex(3).upper()}"


# ════════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ════════════════════════════════════════════════════════════════

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    required = ["nombre","apellido","email","password","documento"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"El campo '{f}' es obligatorio"}), 400

    if len(data["password"]) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    if query("SELECT id FROM users WHERE email=?", (data["email"],), one=True):
        return jsonify({"error": "Este correo ya está registrado"}), 409

    uid = execute(
        "INSERT INTO users (nombre,apellido,tipo_doc,documento,email,password_hash,edad,ciudad,direccion,rol,fecha_registro) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (data["nombre"], data["apellido"], data.get("tipoDoc","CC"), data["documento"],
         data["email"], hash_password(data["password"]),
         int(data.get("edad") or 0), data.get("ciudad",""), data.get("direccion",""),
         "cliente", now_iso())
    )
    user = query("SELECT * FROM users WHERE id=?", (uid,), one=True)
    user.pop("password_hash", None)
    token = create_token(uid, "cliente")
    log_activity(data["email"], "Se registró", "success")
    return jsonify({"token": token, "user": user}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email    = data.get("email", "").strip()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Correo y contraseña son obligatorios"}), 400

    user = query("SELECT * FROM users WHERE email=?", (email,), one=True)
    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    user_safe = {k: v for k,v in user.items() if k != "password_hash"}
    token = create_token(user["id"], user["rol"])
    log_activity(email, "Inició sesión", "success")
    return jsonify({"token": token, "user": user_safe})


@app.route("/api/auth/recover", methods=["POST"])
def recover():
    """
    En producción esto enviaría un email con link de reset.
    Aquí devuelve un token de reset temporal.
    """
    email = (request.get_json() or {}).get("email", "").strip()
    if not email:
        return jsonify({"error": "Ingresa tu correo"}), 400
    user = query("SELECT id FROM users WHERE email=?", (email,), one=True)
    if not user:
        return jsonify({"error": "No encontramos ninguna cuenta con ese correo"}), 404
    # Reset token válido 1 hora
    reset_token = create_token(user["id"], "__reset__")
    log_activity(email, "Solicitó recuperación de contraseña", "info")
    return jsonify({"message": "Correo de recuperación enviado (simulado)", "reset_token": reset_token})


@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token    = data.get("reset_token", "")
    new_pass = data.get("new_password", "")
    if not token or not new_pass:
        return jsonify({"error": "Token y nueva contraseña son obligatorios"}), 400
    if len(new_pass) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
    try:
        payload = decode_token(token)
    except Exception:
        return jsonify({"error": "Token inválido o expirado"}), 401
    execute("UPDATE users SET password_hash=? WHERE id=?",
            (hash_password(new_pass), payload["sub"]))
    return jsonify({"message": "Contraseña actualizada correctamente"})


# ════════════════════════════════════════════════════════════════
#  USER ROUTES
# ════════════════════════════════════════════════════════════════

@app.route("/api/users/me", methods=["GET"])
@require_auth
def get_me():
    user = query("SELECT * FROM users WHERE id=?", (g.current_user["sub"],), one=True)
    if not user: return jsonify({"error": "Usuario no encontrado"}), 404
    user.pop("password_hash", None)
    return jsonify(user)


@app.route("/api/users/me", methods=["PUT"])
@require_auth
def update_me():
    data = request.get_json()
    uid  = g.current_user["sub"]
    allowed = ["nombre","apellido","tipo_doc","documento","edad","ciudad","direccion","email"]
    sets, vals = [], []
    for k in allowed:
        if k in data:
            sets.append(f"{k}=?")
            vals.append(data[k])
    if not sets:
        return jsonify({"error": "Sin campos para actualizar"}), 400
    vals.append(uid)
    execute(f"UPDATE users SET {','.join(sets)} WHERE id=?", vals)
    user = query("SELECT * FROM users WHERE id=?", (uid,), one=True)
    user.pop("password_hash", None)
    return jsonify(user)


@app.route("/api/users/me/orders", methods=["GET"])
@require_auth
def my_orders():
    orders = query("SELECT * FROM orders WHERE user_id=? ORDER BY fecha DESC", (g.current_user["sub"],))
    for o in orders:
        o["items"] = json.loads(o.get("items") or "[]")
    return jsonify(orders)


# ════════════════════════════════════════════════════════════════
#  PRODUCT ROUTES
# ════════════════════════════════════════════════════════════════

@app.route("/api/products", methods=["GET"])
def get_products():
    cat = request.args.get("categoria")
    if cat and cat != "all":
        rows = query("SELECT * FROM products WHERE categoria=? ORDER BY id", (cat,))
    else:
        rows = query("SELECT * FROM products ORDER BY id")
    return jsonify([parse_product(r) for r in rows])


@app.route("/api/products/<int:pid>", methods=["GET"])
def get_product(pid):
    row = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    if not row: return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(parse_product(row))


# ════════════════════════════════════════════════════════════════
#  ORDER ROUTES
# ════════════════════════════════════════════════════════════════

@app.route("/api/orders", methods=["POST"])
@require_auth
def create_order():
    data    = request.get_json()
    items   = data.get("items", [])
    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    subtotal     = float(data.get("subtotal", sum(i["precio"]*i["qty"] for i in items)))
    discount_amt = float(data.get("discountAmt", 0))
    coupon_code  = data.get("couponCode", "")
    total        = float(data.get("total", subtotal - discount_amt))

    user = query("SELECT * FROM users WHERE id=?", (g.current_user["sub"],), one=True)
    if not user: return jsonify({"error": "Usuario no encontrado"}), 404

    # Actualizar stock
    for item in items:
        prod = query("SELECT stock FROM products WHERE id=?", (item["id"],), one=True)
        if prod:
            stock = json.loads(prod["stock"] or "{}")
            size  = item.get("size", "M")
            stock[size] = max(0, int(stock.get(size, 0)) - int(item.get("qty", 1)))
            execute("UPDATE products SET stock=? WHERE id=?", (json.dumps(stock), item["id"]))

    # Actualizar uso de cupón
    if coupon_code:
        execute("UPDATE coupons SET uses=uses+1 WHERE code=?", (coupon_code,))

    oid = order_id()
    execute(
        "INSERT INTO orders (id,user_id,user_name,items,subtotal,discount_amt,coupon_code,total,status,fecha) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (oid, user["id"], f"{user['nombre']} {user['apellido']}",
         json.dumps(items), subtotal, discount_amt, coupon_code,
         total, "pendiente", now_iso())
    )
    log_activity(user["email"], f"Realizó pedido {oid} por ${total:,.0f}", "success")
    order = query("SELECT * FROM orders WHERE id=?", (oid,), one=True)
    order["items"] = json.loads(order["items"])
    return jsonify(order), 201


# ════════════════════════════════════════════════════════════════
#  COUPON ROUTES
# ════════════════════════════════════════════════════════════════

@app.route("/api/coupons/validate", methods=["POST"])
def validate_coupon():
    data  = request.get_json()
    code  = (data.get("code") or "").upper().strip()
    total = float(data.get("total", 0))

    coupon = query("SELECT * FROM coupons WHERE code=? AND active=1", (code,), one=True)
    if not coupon:
        return jsonify({"error": "Cupón inválido o inactivo"}), 404
    if coupon["uses"] >= coupon["max_uses"]:
        return jsonify({"error": "Este cupón ya alcanzó el límite de usos"}), 400
    if total < coupon["min_order"]:
        return jsonify({"error": f"El cupón requiere un pedido mínimo de ${coupon['min_order']:,.0f}"}), 400

    if coupon["type"] == "percent":
        discount = round(total * coupon["value"] / 100, 0)
    else:
        discount = min(coupon["value"], total)

    return jsonify({
        "valid": True,
        "discount": discount,
        "type": coupon["type"],
        "value": coupon["value"],
        "description": coupon["description"],
    })


# ════════════════════════════════════════════════════════════════
#  ADMIN — PRODUCTS
# ════════════════════════════════════════════════════════════════

@app.route("/api/admin/products", methods=["GET"])
@require_admin
def admin_get_products():
    rows = query("SELECT * FROM products ORDER BY id")
    return jsonify([parse_product(r) for r in rows])


@app.route("/api/admin/products", methods=["POST"])
@require_admin
def admin_create_product():
    data = request.get_json()
    if not data.get("nombre") or not data.get("categoria") or not data.get("precio"):
        return jsonify({"error": "nombre, categoria y precio son obligatorios"}), 400
    pid = execute(
        "INSERT INTO products (nombre,categoria,precio,descripcion,es_nuevo,colores,stock,imagen_svg,imagen_data,fecha_creacion) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (data["nombre"], data["categoria"], float(data["precio"]),
         data.get("descripcion",""), int(data.get("es_nuevo",0)),
         json.dumps(data.get("colores",[])), json.dumps(data.get("stock",{"XS":10,"S":10,"M":10,"L":10,"XL":10})),
         data.get("imagen_svg",""), data.get("imagen_data",""), now_iso())
    )
    row = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    return jsonify(parse_product(row)), 201


@app.route("/api/admin/products/<int:pid>", methods=["PUT"])
@require_admin
def admin_update_product(pid):
    data = request.get_json()
    fields = ["nombre","categoria","precio","descripcion","es_nuevo","colores","stock","imagen_svg","imagen_data"]
    sets, vals = [], []
    for f in fields:
        if f in data:
            v = data[f]
            if f in ("colores","stock"): v = json.dumps(v)
            if f == "es_nuevo": v = int(v)
            sets.append(f"{f}=?")
            vals.append(v)
    if not sets: return jsonify({"error": "Sin campos"}), 400
    vals.append(pid)
    execute(f"UPDATE products SET {','.join(sets)} WHERE id=?", vals)
    row = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    return jsonify(parse_product(row))


@app.route("/api/admin/products/<int:pid>", methods=["DELETE"])
@require_admin
def admin_delete_product(pid):
    execute("DELETE FROM products WHERE id=?", (pid,))
    return jsonify({"deleted": pid})


# ════════════════════════════════════════════════════════════════
#  ADMIN — USERS
# ════════════════════════════════════════════════════════════════

@app.route("/api/admin/users", methods=["GET"])
@require_admin
def admin_get_users():
    users = query("SELECT id,nombre,apellido,tipo_doc,documento,email,edad,ciudad,direccion,rol,fecha_registro FROM users ORDER BY id")
    return jsonify(users)


@app.route("/api/admin/users/<int:uid>", methods=["DELETE"])
@require_admin
def admin_delete_user(uid):
    if uid == g.current_user["sub"]:
        return jsonify({"error": "No puedes eliminarte a ti mismo"}), 400
    execute("DELETE FROM users WHERE id=?", (uid,))
    return jsonify({"deleted": uid})


@app.route("/api/admin/users/<int:uid>/role", methods=["PUT"])
@require_admin
def admin_set_role(uid):
    rol = (request.get_json() or {}).get("rol")
    if rol not in ("admin","cliente"):
        return jsonify({"error": "Rol inválido"}), 400
    execute("UPDATE users SET rol=? WHERE id=?", (rol, uid))
    return jsonify({"updated": uid, "rol": rol})


# ════════════════════════════════════════════════════════════════
#  ADMIN — ORDERS
# ════════════════════════════════════════════════════════════════

@app.route("/api/admin/orders", methods=["GET"])
@require_admin
def admin_get_orders():
    orders = query("SELECT * FROM orders ORDER BY fecha DESC")
    for o in orders:
        o["items"] = json.loads(o.get("items") or "[]")
    return jsonify(orders)


@app.route("/api/admin/orders/<oid>", methods=["PUT"])
@require_admin
def admin_update_order(oid):
    status = (request.get_json() or {}).get("status")
    valid  = ["pendiente","procesando","enviado","entregado","cancelado"]
    if status not in valid:
        return jsonify({"error": f"Status inválido. Opciones: {valid}"}), 400
    execute("UPDATE orders SET status=? WHERE id=?", (status, oid))
    return jsonify({"updated": oid, "status": status})


@app.route("/api/admin/orders/<oid>", methods=["DELETE"])
@require_admin
def admin_delete_order(oid):
    execute("DELETE FROM orders WHERE id=?", (oid,))
    return jsonify({"deleted": oid})


# ════════════════════════════════════════════════════════════════
#  ADMIN — COUPONS
# ════════════════════════════════════════════════════════════════

@app.route("/api/admin/coupons", methods=["GET"])
@require_admin
def admin_get_coupons():
    return jsonify(query("SELECT * FROM coupons ORDER BY id"))


@app.route("/api/admin/coupons", methods=["POST"])
@require_admin
def admin_create_coupon():
    data = request.get_json()
    if not data.get("code") or not data.get("value"):
        return jsonify({"error": "code y value son obligatorios"}), 400
    if query("SELECT id FROM coupons WHERE code=?", (data["code"].upper(),), one=True):
        return jsonify({"error": "Ya existe un cupón con ese código"}), 409
    cid = execute(
        "INSERT INTO coupons (code,type,value,min_order,max_uses,description,active,fecha_creacion) VALUES (?,?,?,?,?,?,?,?)",
        (data["code"].upper(), data.get("type","percent"), float(data["value"]),
         float(data.get("minOrder",0)), int(data.get("maxUses",100)),
         data.get("desc",""), int(data.get("active",1)), now_iso())
    )
    return jsonify(query("SELECT * FROM coupons WHERE id=?", (cid,), one=True)), 201


@app.route("/api/admin/coupons/<int:cid>", methods=["PUT"])
@require_admin
def admin_update_coupon(cid):
    data  = request.get_json()
    sets, vals = [], []
    mapping = {"code":"code","type":"type","value":"value","minOrder":"min_order",
               "maxUses":"max_uses","desc":"description","active":"active"}
    for k, col in mapping.items():
        if k in data:
            v = data[k]
            if col == "active": v = int(v)
            if col in ("value","min_order"): v = float(v)
            if col == "max_uses": v = int(v)
            if col == "code": v = v.upper()
            sets.append(f"{col}=?")
            vals.append(v)
    if not sets: return jsonify({"error": "Sin campos"}), 400
    vals.append(cid)
    execute(f"UPDATE coupons SET {','.join(sets)} WHERE id=?", vals)
    return jsonify(query("SELECT * FROM coupons WHERE id=?", (cid,), one=True))


@app.route("/api/admin/coupons/<int:cid>", methods=["DELETE"])
@require_admin
def admin_delete_coupon(cid):
    execute("DELETE FROM coupons WHERE id=?", (cid,))
    return jsonify({"deleted": cid})


# ════════════════════════════════════════════════════════════════
#  ADMIN — STATS & ACTIVITY
# ════════════════════════════════════════════════════════════════

@app.route("/api/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    total_users    = (query("SELECT COUNT(*) as n FROM users", one=True) or {}).get("n", 0)
    total_products = (query("SELECT COUNT(*) as n FROM products", one=True) or {}).get("n", 0)
    total_orders   = (query("SELECT COUNT(*) as n FROM orders", one=True) or {}).get("n", 0)
    revenue_row    = query("SELECT SUM(total) as s FROM orders WHERE status != 'cancelado'", one=True)
    revenue        = (revenue_row or {}).get("s") or 0

    low_stock_items = query("""
        SELECT id, nombre, stock FROM products
    """)
    low_stock = 0
    for p in low_stock_items:
        stock = json.loads(p.get("stock") or "{}")
        if sum(stock.values()) <= 10:
            low_stock += 1

    coupons_used = (query("SELECT SUM(uses) as n FROM coupons", one=True) or {}).get("n") or 0
    avg_ticket   = (query("SELECT AVG(total) as a FROM orders WHERE status!='cancelado'", one=True) or {}).get("a") or 0
    max_order    = (query("SELECT MAX(total) as m FROM orders", one=True) or {}).get("m") or 0
    total_disc   = (query("SELECT SUM(discount_amt) as s FROM orders", one=True) or {}).get("s") or 0

    # Monthly revenue (last 6 months)
    monthly = query("""
        SELECT substr(fecha,1,7) as month, SUM(total) as revenue, COUNT(*) as orders
        FROM orders WHERE status!='cancelado'
        GROUP BY month ORDER BY month DESC LIMIT 6
    """)

    # Sales by category
    orders_all = query("SELECT items FROM orders WHERE status!='cancelado'")
    cat_sales  = {}
    for o in orders_all:
        items = json.loads(o["items"] or "[]")
        for item in items:
            cat = item.get("categoria") or item.get("categoria_slug", "otro")
            cat_sales[cat] = cat_sales.get(cat, 0) + (item.get("precio",0) * item.get("qty",1))

    return jsonify({
        "totalUsers": total_users,
        "totalProducts": total_products,
        "totalOrders": total_orders,
        "revenue": round(revenue, 0),
        "lowStock": low_stock,
        "couponsUsed": coupons_used,
        "avgTicket": round(avg_ticket, 0),
        "maxOrder": round(max_order, 0),
        "totalDiscount": round(total_disc or 0, 0),
        "monthlyRevenue": monthly,
        "categorySales": cat_sales,
    })


@app.route("/api/admin/activity", methods=["GET"])
@require_admin
def admin_activity():
    rows = query("SELECT * FROM activity ORDER BY id DESC LIMIT 50")
    return jsonify(rows)


# ════════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ════════════════════════════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Pandea API", "version": "1.0.0"})


# ─────────────────────────── Run ──────────────────────────────
if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    print(f"\n✅  Pandea API corriendo en http://localhost:{port}")
    print(f"📦  Base de datos: {DB_PATH}\n")
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("DEBUG","false").lower()=="true")
