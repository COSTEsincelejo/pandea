from flask import Blueprint, request, jsonify
from backend.models.database import query, execute
from backend.middleware.auth_middleware import create_token
import hashlib, secrets, datetime

auth_bp = Blueprint("auth", __name__)

def hash_password(password):
    salt = secrets.token_hex(16)
    h = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"sha256${salt}${h}"

def check_password(password, hashed):
    try:
        _, salt, h = hashed.split("$")
        return hashlib.sha256((password + salt).encode()).hexdigest() == h
    except:
        return False

def now_iso():
    return datetime.datetime.utcnow().isoformat()

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    for f in ["nombre","apellido","email","password","documento"]:
        if not data.get(f):
            return jsonify({"error": f"El campo '{f}' es obligatorio"}), 400
    if len(data["password"]) < 6:
        return jsonify({"error": "Mínimo 6 caracteres"}), 400
    if query("SELECT id FROM users WHERE email=?", (data["email"],), one=True):
        return jsonify({"error": "Correo ya registrado"}), 409
    uid = execute(
        "INSERT INTO users (nombre,apellido,tipo_doc,documento,email,password_hash,edad,ciudad,direccion,rol,fecha_registro) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (data["nombre"],data["apellido"],data.get("tipoDoc","CC"),data["documento"],
         data["email"],hash_password(data["password"]),
         int(data.get("edad") or 0),data.get("ciudad",""),data.get("direccion",""),
         "cliente",now_iso())
    )
    user = query("SELECT * FROM users WHERE id=?", (uid,), one=True)
    user.pop("password_hash", None)
    return jsonify({"token": create_token(uid, "cliente"), "user": user}), 201

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email","").strip()
    password = data.get("password","")
    if not email or not password:
        return jsonify({"error": "Correo y contraseña obligatorios"}), 400
    user = query("SELECT * FROM users WHERE email=?", (email,), one=True)
    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"error": "Credenciales incorrectas"}), 401
    user_safe = {k:v for k,v in user.items() if k != "password_hash"}
    return jsonify({"token": create_token(user["id"], user["rol"]), "user": user_safe})

@auth_bp.route("/api/auth/recover", methods=["POST"])
def recover():
    email = (request.get_json() or {}).get("email","").strip()
    if not email:
        return jsonify({"error": "Ingresa tu correo"}), 400
    user = query("SELECT id FROM users WHERE email=?", (email,), one=True)
    if not user:
        return jsonify({"error": "Correo no encontrado"}), 404
    return jsonify({"message": "Correo de recuperación enviado (simulado)"})
