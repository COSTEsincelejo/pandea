import datetime
from functools import wraps
from flask import request, jsonify, g
from backend.config import Config

try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    import base64, json as _json
    JWT_AVAILABLE = False

def create_token(user_id, rol):
    payload = {
        "sub": user_id,
        "rol": rol,
        "iat": int(datetime.datetime.utcnow().timestamp()),
        "exp": int((datetime.datetime.utcnow() + datetime.timedelta(seconds=Config.TOKEN_EXPIRY)).timestamp()),
    }
    if JWT_AVAILABLE:
        return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
    import base64, json
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()

def decode_token(token):
    if JWT_AVAILABLE:
        import jwt as _jwt
        return _jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
    import base64, json
    return json.loads(base64.urlsafe_b64decode(token.encode() + b"=="))

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "No autorizado"}), 401
        try:
            g.current_user = decode_token(auth[7:])
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
            return jsonify({"error": "Acceso denegado"}), 403
        return f(*args, **kwargs)
    return wrapper
