import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.models.database import close_db, get_db
from backend.routes.auth_routes import auth_bp
from backend.routes.product_routes import product_bp
from backend.routes.order_routes import order_bp

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app, origins="*")

# ── Registrar blueprints ──────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(product_bp)
app.register_blueprint(order_bp)

# ── Cerrar DB al terminar request ────────────────────────────
app.teardown_appcontext(close_db)

# ── Servir frontend ──────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory("../frontend", "index.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory("../frontend", filename)

# ── WhatsApp config ──────────────────────────────────────────
WHATSAPP_NUMBER = Config.WHATSAPP_NUMBER

@app.route("/api/config/whatsapp", methods=["GET"])
def get_whatsapp():
    return jsonify({"number": WHATSAPP_NUMBER})

# ── Health check ─────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Pandea API", "version": "2.0.0"})

# ── Init DB ──────────────────────────────────────────────────
def init_db():
    with app.app_context():
        db = get_db()
        from app import SCHEMA, _seed_products, _seed_coupons
        db.executescript(SCHEMA)
        db.commit()
        _seed_products()
        _seed_coupons()

if __name__ == "__main__":
    port = Config.PORT
    print(f"\n✅  Pandea API v2.0 corriendo en http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
