const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const couponModel = require('../models/couponModel');
const { query } = require('../config/db');

async function createOrder(payload) {
  const couponCode = payload.couponCode || null;
  const discountAmount = payload.discountAmt ? Number(payload.discountAmt) : 0;
  const total = Number(payload.total);
  const subtotal = Number(payload.subtotal);

  if (couponCode) {
    const coupon = await couponModel.getCouponByCode(couponCode);
    if (!coupon || !coupon.activo) {
      const error = new Error('Cupón inválido o inactivo');
      error.status = 400;
      throw error;
    }
    if (coupon.usos >= coupon.max_usos) {
      const error = new Error('Cupón agotado');
      error.status = 400;
      throw error;
    }
    if (subtotal < coupon.min_orden) {
      const error = new Error(`Monto mínimo de orden $${coupon.min_orden}`);
      error.status = 400;
      throw error;
    }
  }

  const order = await orderModel.createOrder({
    id_cliente: payload.id_cliente,
    id_vendedor: payload.id_vendedor || null,
    subtotal,
    descuento: discountAmount,
    total,
    metodo_contacto: payload.metodo_contacto || 'whatsapp',
    estado: 'pendiente',
    codigo_cupon: couponCode,
  });

  await Promise.all(
    payload.items.map(async (item) => {
      await orderModel.createDetail({
        id_venta: order.id,
        id_producto: item.id,
        cantidad: item.qty || item.quantity || 1,
        precio_unitario: item.precio || item.price || 0,
      });
      const product = await productModel.getProductById(item.id);
      if (product) {
        const nuevaCantidad = Math.max(0, product.stock - (item.qty || item.quantity || 1));
        await productModel.updateProductStock(item.id, nuevaCantidad);
      }
    })
  );

  if (couponCode) {
    await couponModel.incrementCouponUses(couponCode);
  }

  return {
    ...order,
    items: payload.items,
  };
}

module.exports = {
  createOrder,
};
