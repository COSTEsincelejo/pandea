from flask import Blueprint, request, jsonify, g
from backend.models.database import query, execute
from backend.middleware.auth_middleware import require_auth, require_admin
import json, datetime, secrets

order_bp = Blueprint("orders", __name__)

def now_iso():
    return datetime.datetime.utcnow().isoformat()

def order_id():
    ts = datetime.datetime.utcnow().strftime("%y%m%d%H%M%S")
    return f"PND-{ts}-{secrets.token_hex(3).upper()}"

@order_bp.route("/api/orders", methods=["POST"])
@require_auth
def create_order():
    data  = request.get_json()
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400
    subtotal     = float(data.get("subtotal", sum(i["precio"]*i["qty"] for i in items)))
    discount_amt = float(data.get("discountAmt", 0))
    total        = float(data.get("total", subtotal - discount_amt))
    coupon_code  = data.get("couponCode", "")
    user = query("SELECT * FROM users WHERE id=?", (g.current_user["sub"],), one=True)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    for item in items:
        prod = query("SELECT stock FROM products WHERE id=?", (item["id"],), one=True)
        if prod:
            stock = json.loads(prod["stock"] or "{}")
            size  = item.get("size", "M")
            stock[size] = max(0, int(stock.get(size, 0)) - int(item.get("qty", 1)))
            execute("UPDATE products SET stock=? WHERE id=?", (json.dumps(stock), item["id"]))
    if coupon_code:
        execute("UPDATE coupons SET uses=uses+1 WHERE code=?", (coupon_code,))
    oid = order_id()
    execute(
        "INSERT INTO orders (id,user_id,user_name,items,subtotal,discount_amt,coupon_code,total,status,fecha) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (oid, user["id"], f"{user['nombre']} {user['apellido']}",
         json.dumps(items), subtotal, discount_amt, coupon_code,
         total, "pendiente", now_iso())
    )
    order = query("SELECT * FROM orders WHERE id=?", (oid,), one=True)
    order["items"] = json.loads(order["items"])
    return jsonify(order), 201

@order_bp.route("/api/users/me/orders", methods=["GET"])
@require_auth
def my_orders():
    orders = query("SELECT * FROM orders WHERE user_id=? ORDER BY fecha DESC", (g.current_user["sub"],))
    for o in orders:
        o["items"] = json.loads(o.get("items") or "[]")
    return jsonify(orders)

@order_bp.route("/api/admin/orders", methods=["GET"])
@require_admin
def admin_get_orders():
    orders = query("SELECT * FROM orders ORDER BY fecha DESC")
    for o in orders:
        o["items"] = json.loads(o.get("items") or "[]")
    return jsonify(orders)

@order_bp.route("/api/admin/orders/<oid>", methods=["PUT"])
@require_admin
def admin_update_order(oid):
    status = (request.get_json() or {}).get("status")
    valid  = ["pendiente","procesando","enviado","entregado","cancelado"]
    if status not in valid:
        return jsonify({"error": f"Status inválido. Opciones: {valid}"}), 400
    execute("UPDATE orders SET status=? WHERE id=?", (status, oid))
    return jsonify({"updated": oid, "status": status})

@order_bp.route("/api/admin/orders/<oid>", methods=["DELETE"])
@require_admin
def admin_delete_order(oid):
    execute("DELETE FROM orders WHERE id=?", (oid,))
    return jsonify({"deleted": oid})
