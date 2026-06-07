import api from '../api/client.js';

export async function getWhatsAppNumber() {
  try {
    const response = await api.get('/config/whatsapp');
    if (response && response.data && response.data.number) return response.data.number;
  } catch (err) {
    // ignore and fallback
  }
  return '573017056143';
}

export function formatWhatsappMessage(product) {
  return `Hola, estoy interesado en este producto de Pandea:%0A%0A` +
    `*${product.nombre}*%0A` +
    `Precio: $${Number(product.precio).toFixed(2)}%0A` +
    `${product.descripcion ? `Descripción: ${product.descripcion}%0A` : ''}` +
    `${product.stock != null ? `Stock disponible: ${product.stock}%0A` : ''}` +
    `%0APor favor, quiero más información y condiciones de compra.`;
}

export function formatCartWhatsappMessage(items, subtotal, couponCode = '') {
  const lines = [
    'Hola, quiero realizar una compra por WhatsApp.%0A',
    'Detalles del pedido:%0A',
  ];

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.nombre} - Cantidad: ${item.quantity} - Precio unitario: $${Number(item.precio).toFixed(2)}%0A`
    );
  });

  lines.push(`%0ASubtotal: $${subtotal.toFixed(2)}%0A`);

  if (couponCode) {
    lines.push(`Cupón: ${couponCode}%0A`);
  }

  lines.push('%0APor favor, indícame cómo continuar con la compra y el envío.');

  return lines.join('');
}

export function buildWhatsappUrl(number, message) {
  const cleaned = String(number).replace(/[^0-9]/g, '');
  // Use wa.me short link with text parameter; message is expected pre-encoded
  return `https://wa.me/${cleaned}?text=${message}`;
}
