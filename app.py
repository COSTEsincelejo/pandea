"""
Pandea API - Backend completo con Flask + SQLite + JWT
Solo el email ADMIN_EMAIL tiene acceso al panel de administrador.
"""

import os, sqlite3, hashlib, secrets, json
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS

# ─── Configuración ────────────────────────────────────────────────
ADMIN_EMAIL   = "cristianccbr@gmail.com"   # ← ÚNICO admin permitido
SECRET_KEY    = os.environ.get("SECRET_KEY", "pandea-secret-2026-xK9mP")
DB_PATH       = os.environ.get("DB_PATH", "pandea.db")
TOKEN_HOURS   = 72

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Base de datos ─────────────────────────────────────────────────
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db: db.close()

def init_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre       TEXT NOT NULL,
        apellido     TEXT NOT NULL,
        tipo_doc     TEXT NOT NULL DEFAULT 'CC',
        documento    TEXT NOT NULL,
        email        TEXT NOT NULL UNIQUE,
        password     TEXT NOT NULL,
        edad         INTEGER,
        ciudad       TEXT,
        direccion    TEXT,
        rol          TEXT NOT NULL DEFAULT 'cliente',
        created_at   TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre       TEXT NOT NULL,
        precio       REAL NOT NULL,
        categoria    TEXT NOT NULL,
        descripcion  TEXT,
        imagen       TEXT,
        stock_s      INTEGER DEFAULT 0,
        stock_m      INTEGER DEFAULT 0,
        stock_l      INTEGER DEFAULT 0,
        stock_xl     INTEGER DEFAULT 0,
        activo       INTEGER DEFAULT 1,
        created_at   TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL,
        user_name    TEXT NOT NULL,
        user_email   TEXT NOT NULL,
        items        TEXT NOT NULL,
        subtotal     REAL NOT NULL,
        descuento    REAL DEFAULT 0,
        total        REAL NOT NULL,
        cupon        TEXT,
        estado       TEXT DEFAULT 'pendiente',
        direccion    TEXT,
        created_at   TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS coupons (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo       TEXT NOT NULL UNIQUE,
        tipo         TEXT NOT NULL DEFAULT 'percent',
        valor        REAL NOT NULL,
        minimo       REAL DEFAULT 0,
        usos_max     INTEGER DEFAULT 100,
        usos_actual  INTEGER DEFAULT 0,
        activo       INTEGER DEFAULT 1,
        created_at   TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name    TEXT,
        accion       TEXT,
        estado       TEXT,
        created_at   TEXT NOT NULL
    );
    """)

    # Productos de ejemplo si no hay ninguno
    count = db.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        products = [
            ("Blusa Lino Natural", 89000, "mujer", "Blusa confeccionada en lino 100% natural", None, 5, 8, 6, 3, now),
            ("Pantalón Algodón Orgánico", 125000, "mujer", "Corte recto, algodón orgánico certificado", None, 4, 7, 5, 2, now),
            ("Vestido Primavera", 149000, "mujer", "Vestido fluido ideal para la temporada", None, 3, 6, 4, 1, now),
            ("Camisa Lino Hombre", 98000, "hombre", "Camisa casual en lino natural", None, 5, 8, 7, 4, now),
            ("Pantalón Chino", 115000, "hombre", "Corte slim, tejido de algodón premium", None, 4, 7, 6, 3, now),
            ("Camiseta Básica", 65000, "hombre", "Camiseta en algodón pima", None, 10, 12, 10, 6, now),
            ("Bolso Tela Natural", 75000, "accesorios", "Bolso artesanal en tela reciclada", None, 0, 15, 0, 0, now),
            ("Cinturón Cuero Vegano", 55000, "accesorios", "Cinturón en cuero vegano artesanal", None, 0, 10, 0, 0, now),
        ]
        db.executemany("""
            INSERT INTO products (nombre,precio,categoria,descripcion,imagen,stock_s,stock_m,stock_l,stock_xl,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        """, products)

        # Cupón de ejemplo
        db.execute("""
            INSERT INTO coupons (codigo,tipo,valor,minimo,usos_max,created_at)
            VALUES ('PANDEA10','percent',10,50000,100,?)
        """, (datetime.now(timezone.utc).isoformat(),))

    db.commit()
    db.close()
    print(f"✅  Pandea API lista")
    print(f"🔒  Admin: {ADMIN_EMAIL}")
    print(f"🗄️   DB: {os.path.abspath(DB_PATH)}")

# ─── Auth helpers ──────────────────────────────────────────────────
def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def make_token(user_id, email, rol):
    payload = {"user_id": user_id, "email": email, "rol": rol,
                "exp": (datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS)).isoformat()}
    raw = json.dumps(payload) + SECRET_KEY
    sig = hashlib.sha256(raw.encode()).hexdigest()
    token_data = json.dumps({"payload": payload, "sig": sig})
    return token_data.encode().hex()

def verify_token(token):
    try:
        token_data = json.loads(bytes.fromhex(token).decode())
        payload = token_data["payload"]
        sig     = token_data["sig"]
        raw     = json.dumps(payload) + SECRET_KEY
        if hashlib.sha256(raw.encode()).hexdigest() != sig:
            return None
        exp = datetime.fromisoformat(payload["exp"])
        if datetime.now(timezone.utc) > exp:
            return None
        return payload
    except Exception:
        return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "No autorizado"}), 401
        g.user = payload
        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "No autorizado"}), 401
        # Doble verificación: token válido Y email exacto del admin
        if payload.get("email") != ADMIN_EMAIL:
            return jsonify({"error": "Acceso denegado. Solo el administrador puede realizar esta acción."}), 403
        g.user = payload
        return f(*args, **kwargs)
    return decorated

def row_to_dict(row):
    return dict(row) if row else None

# ─── Health ────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Pandea API", "version": "2.0.0"})

# ─── AUTH ──────────────────────────────────────────────────────────
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    required = ["nombre", "apellido", "email", "password", "documento"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Campo requerido: {field}"}), 400

    email = data["email"].lower().strip()
    db = get_db()

    if db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone():
        return jsonify({"error": "Ya existe una cuenta con ese email"}), 409

    # El rol siempre es 'cliente' al registrarse
    # Solo ADMIN_EMAIL tiene rol admin, y eso se asigna internamente
    rol = "admin" if email == ADMIN_EMAIL else "cliente"

    db.execute("""
        INSERT INTO users (nombre,apellido,tipo_doc,documento,email,password,edad,ciudad,direccion,rol,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (
        data["nombre"], data["apellido"],
        data.get("tipoDoc", "CC"), data["documento"],
        email, hash_password(data["password"]),
        data.get("edad"), data.get("ciudad"), data.get("direccion"),
        rol, datetime.now(timezone.utc).isoformat()
    ))
    db.commit()

    user = row_to_dict(db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone())
    token = make_token(user["id"], user["email"], user["rol"])

    db.execute("INSERT INTO activity (user_name,accion,estado,created_at) VALUES (?,?,?,?)",
               (f"{user['nombre']} {user['apellido']}", "Registro", "exitoso", datetime.now(timezone.utc).isoformat()))
    db.commit()

    return jsonify({"token": token, "user": _safe_user(user)}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email    = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email y contraseña requeridos"}), 400

    db  = get_db()
    user = row_to_dict(db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone())

    if not user or user["password"] != hash_password(password):
        return jsonify({"error": "Email o contraseña incorrectos"}), 401

    # Si es el admin email, forzar rol admin en BD
    if email == ADMIN_EMAIL and user["rol"] != "admin":
        db.execute("UPDATE users SET rol='admin' WHERE email=?", (email,))
        db.commit()
        user["rol"] = "admin"

    token = make_token(user["id"], user["email"], user["rol"])

    db.execute("INSERT INTO activity (user_name,accion,estado,created_at) VALUES (?,?,?,?)",
               (f"{user['nombre']} {user['apellido']}", "Login", "exitoso", datetime.now(timezone.utc).isoformat()))
    db.commit()

    return jsonify({"token": token, "user": _safe_user(user)})

@app.route("/api/auth/me", methods=["GET"])
@require_auth
def me():
    db   = get_db()
    user = row_to_dict(db.execute("SELECT * FROM users WHERE id=?", (g.user["user_id"],)).fetchone())
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({"user": _safe_user(user)})

def _safe_user(u):
    return {k: v for k, v in u.items() if k != "password"}

# ─── PRODUCTOS (público) ───────────────────────────────────────────
@app.route("/api/products", methods=["GET"])
def get_products():
    cat    = request.args.get("categoria")
    search = request.args.get("q")
    db     = get_db()

    query  = "SELECT * FROM products WHERE activo=1"
    params = []

    if cat:
        query += " AND categoria=?"
        params.append(cat)
    if search:
        query += " AND (nombre LIKE ? OR descripcion LIKE ?)"
        params += [f"%{search}%", f"%{search}%"]

    products = [row_to_dict(r) for r in db.execute(query, params).fetchall()]
    return jsonify({"products": products})

@app.route("/api/products/<int:pid>", methods=["GET"])
def get_product(pid):
    db = get_db()
    p  = row_to_dict(db.execute("SELECT * FROM products WHERE id=? AND activo=1", (pid,)).fetchone())
    if not p:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({"product": p})

# ─── CUPONES (público: validar) ────────────────────────────────────
@app.route("/api/coupons/validate", methods=["POST"])
def validate_coupon():
    data   = request.get_json() or {}
    codigo = (data.get("codigo") or "").upper().strip()
    total  = float(data.get("total") or 0)

    db     = get_db()
    coupon = row_to_dict(db.execute(
        "SELECT * FROM coupons WHERE codigo=? AND activo=1", (codigo,)
    ).fetchone())

    if not coupon:
        return jsonify({"error": "Cupón inválido o expirado"}), 404
    if coupon["usos_actual"] >= coupon["usos_max"]:
        return jsonify({"error": "Este cupón ya alcanzó su límite de usos"}), 400
    if total < coupon["minimo"]:
        return jsonify({"error": f"Compra mínima: ${coupon['minimo']:,.0f}"}), 400

    descuento = (total * coupon["valor"] / 100) if coupon["tipo"] == "percent" else coupon["valor"]
    descuento = min(descuento, total)

    return jsonify({"coupon": coupon, "descuento": descuento})

# ─── PEDIDOS ───────────────────────────────────────────────────────
@app.route("/api/orders", methods=["POST"])
@require_auth
def create_order():
    data  = request.get_json() or {}
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    db       = get_db()
    subtotal = float(data.get("subtotal", 0))
    descuento= float(data.get("descuento", 0))
    total    = float(data.get("total", subtotal - descuento))
    cupon    = data.get("cupon")

    # Descontar stock
    for item in items:
        col_map = {"S": "stock_s", "M": "stock_m", "L": "stock_l", "XL": "stock_xl"}
        col = col_map.get(item.get("size", "M"), "stock_m")
        db.execute(f"UPDATE products SET {col}=MAX(0,{col}-?) WHERE id=?",
                   (item.get("qty", 1), item["id"]))

    # Actualizar usos cupón
    if cupon:
        db.execute("UPDATE coupons SET usos_actual=usos_actual+1 WHERE codigo=?", (cupon.upper(),))

    user = row_to_dict(db.execute("SELECT * FROM users WHERE id=?", (g.user["user_id"],)).fetchone())

    db.execute("""
        INSERT INTO orders (user_id,user_name,user_email,items,subtotal,descuento,total,cupon,estado,direccion,created_at)
        VALUES (?,?,?,?,?,?,?,?,'pendiente',?,?)
    """, (
        g.user["user_id"],
        f"{user['nombre']} {user['apellido']}",
        user["email"],
        json.dumps(items),
        subtotal, descuento, total, cupon,
        data.get("direccion", user.get("direccion", "")),
        datetime.now(timezone.utc).isoformat()
    ))
    db.commit()

    order_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]
    db.execute("INSERT INTO activity (user_name,accion,estado,created_at) VALUES (?,?,?,?)",
               (user["nombre"], f"Pedido #{order_id}", "completado", datetime.now(timezone.utc).isoformat()))
    db.commit()

    return jsonify({"order_id": order_id, "message": "Pedido creado"}), 201

@app.route("/api/orders/mine", methods=["GET"])
@require_auth
def my_orders():
    db     = get_db()
    orders = [row_to_dict(r) for r in
              db.execute("SELECT * FROM orders WHERE user_id=? ORDER BY id DESC", (g.user["user_id"],)).fetchall()]
    for o in orders:
        o["items"] = json.loads(o["items"])
    return jsonify({"orders": orders})

# ─── ADMIN — solo ADMIN_EMAIL ──────────────────────────────────────
@app.route("/api/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    db = get_db()
    stats = {
        "usuarios":  db.execute("SELECT COUNT(*) FROM users").fetchone()[0],
        "productos": db.execute("SELECT COUNT(*) FROM products WHERE activo=1").fetchone()[0],
        "pedidos":   db.execute("SELECT COUNT(*) FROM orders").fetchone()[0],
        "ingresos":  db.execute("SELECT COALESCE(SUM(total),0) FROM orders WHERE estado!='cancelado'").fetchone()[0],
    }
    return jsonify(stats)

@app.route("/api/admin/users", methods=["GET"])
@require_admin
def admin_users():
    db    = get_db()
    users = [_safe_user(row_to_dict(r)) for r in db.execute("SELECT * FROM users ORDER BY id DESC").fetchall()]
    return jsonify({"users": users})

@app.route("/api/admin/users/<int:uid>/rol", methods=["PUT"])
@require_admin
def admin_toggle_rol(uid):
    db   = get_db()
    user = row_to_dict(db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone())
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    # No se puede quitar el rol al admin principal
    if user["email"] == ADMIN_EMAIL:
        return jsonify({"error": "No puedes modificar el rol del administrador principal"}), 403
    new_rol = "cliente" if user["rol"] == "admin" else "admin"
    db.execute("UPDATE users SET rol=? WHERE id=?", (new_rol, uid))
    db.commit()
    return jsonify({"rol": new_rol})

@app.route("/api/admin/products", methods=["GET"])
@require_admin
def admin_products():
    db       = get_db()
    products = [row_to_dict(r) for r in db.execute("SELECT * FROM products ORDER BY id DESC").fetchall()]
    return jsonify({"products": products})

@app.route("/api/admin/products", methods=["POST"])
@require_admin
def admin_create_product():
    data = request.get_json() or {}
    db   = get_db()
    db.execute("""
        INSERT INTO products (nombre,precio,categoria,descripcion,imagen,stock_s,stock_m,stock_l,stock_xl,activo,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,1,?)
    """, (
        data.get("nombre"), float(data.get("precio", 0)),
        data.get("categoria"), data.get("descripcion"), data.get("imagen"),
        int(data.get("stock_s", 0)), int(data.get("stock_m", 0)),
        int(data.get("stock_l", 0)), int(data.get("stock_xl", 0)),
        datetime.now(timezone.utc).isoformat()
    ))
    db.commit()
    pid = db.execute("SELECT last_insert_rowid()").fetchone()[0]
    return jsonify({"id": pid, "message": "Producto creado"}), 201

@app.route("/api/admin/products/<int:pid>", methods=["PUT"])
@require_admin
def admin_update_product(pid):
    data = request.get_json() or {}
    db   = get_db()
    db.execute("""
        UPDATE products SET nombre=?,precio=?,categoria=?,descripcion=?,imagen=?,
        stock_s=?,stock_m=?,stock_l=?,stock_xl=?,activo=? WHERE id=?
    """, (
        data.get("nombre"), float(data.get("precio", 0)),
        data.get("categoria"), data.get("descripcion"), data.get("imagen"),
        int(data.get("stock_s", 0)), int(data.get("stock_m", 0)),
        int(data.get("stock_l", 0)), int(data.get("stock_xl", 0)),
        int(data.get("activo", 1)), pid
    ))
    db.commit()
    return jsonify({"message": "Producto actualizado"})

@app.route("/api/admin/products/<int:pid>", methods=["DELETE"])
@require_admin
def admin_delete_product(pid):
    db = get_db()
    db.execute("UPDATE products SET activo=0 WHERE id=?", (pid,))
    db.commit()
    return jsonify({"message": "Producto eliminado"})

@app.route("/api/admin/orders", methods=["GET"])
@require_admin
def admin_orders():
    db     = get_db()
    orders = [row_to_dict(r) for r in db.execute("SELECT * FROM orders ORDER BY id DESC").fetchall()]
    for o in orders:
        o["items"] = json.loads(o["items"])
    return jsonify({"orders": orders})

@app.route("/api/admin/orders/<int:oid>/status", methods=["PUT"])
@require_admin
def admin_update_order(oid):
    data   = request.get_json() or {}
    estado = data.get("estado")
    db     = get_db()
    db.execute("UPDATE orders SET estado=? WHERE id=?", (estado, oid))
    db.commit()
    return jsonify({"message": "Estado actualizado"})

@app.route("/api/admin/coupons", methods=["GET"])
@require_admin
def admin_coupons():
    db      = get_db()
    coupons = [row_to_dict(r) for r in db.execute("SELECT * FROM coupons ORDER BY id DESC").fetchall()]
    return jsonify({"coupons": coupons})

@app.route("/api/admin/coupons", methods=["POST"])
@require_admin
def admin_create_coupon():
    data = request.get_json() or {}
    db   = get_db()
    try:
        db.execute("""
            INSERT INTO coupons (codigo,tipo,valor,minimo,usos_max,activo,created_at)
            VALUES (?,?,?,?,?,1,?)
        """, (
            data.get("codigo", "").upper(),
            data.get("tipo", "percent"),
            float(data.get("valor", 0)),
            float(data.get("minimo", 0)),
            int(data.get("usos_max", 100)),
            datetime.now(timezone.utc).isoformat()
        ))
        db.commit()
        return jsonify({"message": "Cupón creado"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Ya existe un cupón con ese código"}), 409

@app.route("/api/admin/coupons/<int:cid>", methods=["DELETE"])
@require_admin
def admin_delete_coupon(cid):
    db = get_db()
    db.execute("UPDATE coupons SET activo=0 WHERE id=?", (cid,))
    db.commit()
    return jsonify({"message": "Cupón desactivado"})

@app.route("/api/admin/activity", methods=["GET"])
@require_admin
def admin_activity():
    db  = get_db()
    log = [row_to_dict(r) for r in
           db.execute("SELECT * FROM activity ORDER BY id DESC LIMIT 100").fetchall()]
    return jsonify({"activity": log})

# ─── Inicio ────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
