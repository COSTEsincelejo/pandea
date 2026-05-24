from flask import Blueprint, request, jsonify
from backend.models.database import query, execute
from backend.middleware.auth_middleware import require_admin
import json, datetime

product_bp = Blueprint("products", __name__)

def parse_product(row):
    row["colores"] = json.loads(row.get("colores") or "[]")
    row["stock"] = json.loads(row.get("stock") or "{}")
    row["es_nuevo"] = bool(row.get("es_nuevo"))
    return row

def now_iso():
    return datetime.datetime.utcnow().isoformat()

@product_bp.route("/api/products", methods=["GET"])
def get_products():
    cat = request.args.get("categoria")
    if cat and cat != "all":
        rows = query("SELECT * FROM products WHERE categoria=? ORDER BY id", (cat,))
    else:
        rows = query("SELECT * FROM products ORDER BY id")
    return jsonify([parse_product(r) for r in rows])

@product_bp.route("/api/products/<int:pid>", methods=["GET"])
def get_product(pid):
    row = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    if not row:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(parse_product(row))

@product_bp.route("/api/admin/products", methods=["GET"])
@require_admin
def admin_get_products():
    rows = query("SELECT * FROM products ORDER BY id")
    return jsonify([parse_product(r) for r in rows])

@product_bp.route("/api/admin/products", methods=["POST"])
@require_admin
def admin_create_product():
    data = request.get_json()
    if not data.get("nombre") or not data.get("categoria") or not data.get("precio"):
        return jsonify({"error": "nombre, categoria y precio son obligatorios"}), 400
    stock_default = {"XS": 10, "S": 10, "M": 10, "L": 10, "XL": 10}
    pid = execute(
        "INSERT INTO products (nombre,categoria,precio,descripcion,es_nuevo,colores,stock,imagen_svg,imagen_data,fecha_creacion) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (data["nombre"], data["categoria"], float(data["precio"]),
         data.get("descripcion", ""), int(data.get("es_nuevo", 0)),
         json.dumps(data.get("colores", [])),
         json.dumps(data.get("stock", stock_default)),
         data.get("imagen_svg", ""), data.get("imagen_data", ""), now_iso())
    )
    row = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    return jsonify(parse_product(row)), 201

@product_bp.route("/api/admin/products/<int:pid>", methods=["PUT"])
@require_admin
def admin_update_product(pid):
    data = request.get_json()
    fields = ["nombre", "categoria", "precio", "descripcion", "es_nuevo", "colores", "stock"]
    sets, vals = [], []
    for f in fields:
        if f in data:
            v = data[f]
            if f in ("colores", "stock"):
                v = json.dumps(v)
            if f == "es_nuevo":
                v = int(v)
            sets.append(f + "=?")
            vals.append(v)
    if not sets:
        return jsonify({"error": "Sin campos"}), 400
    vals.append(pid)
    execute("UPDATE products SET " + ",".join(sets) + " WHERE id=?", vals)
    row = query("SELECT * FROM products WHERE id=?", (pid,), one=True)
    return jsonify(parse_product(row))

@product_bp.route("/api/admin/products/<int:pid>", methods=["DELETE"])
@require_admin
def admin_delete_product(pid):
    execute("DELETE FROM products WHERE id=?", (pid,))
    return jsonify({"deleted": pid})
