/**
 * Generate WhatsApp order message for a single product
 */
export function getOrderMessage(product, quantity = 1, price) {
  const displayPrice = price || product.discountPrice || product.price;
  return `Hello Sugandhika! 🌿

I would like to order:

*Product:* ${product.name}
*Quantity:* ${quantity}
*Price:* Rs. ${Number(displayPrice).toLocaleString('en-IN')}
${product.selectedVariant ? `*Variant:* ${product.selectedVariant}` : ''}

Please provide delivery and payment details.

Thank you!`;
}

/**
 * Generate WhatsApp cart checkout message
 */
export function getCartMessage(items, subtotal, total) {
  if (!items || items.length === 0) return '';

  const itemLines = items
    .map(
      (item) =>
        `• ${item.product.name} × ${item.quantity} = Rs. ${(
          (item.product.discountPrice || item.product.price) * item.quantity
        ).toLocaleString('en-IN')}`
    )
    .join('\n');

  return `Hello Sugandhika! 🌿

I'd like to place an order:

*ORDER SUMMARY*
${itemLines}

*Subtotal:* Rs. ${Number(subtotal).toLocaleString('en-IN')}
*Total:* Rs. ${Number(total).toLocaleString('en-IN')}

Please provide delivery and payment details.

Thank you!`;
}

/**
 * Generate WhatsApp contact/inquiry message
 */
export function getContactMessage(name = '') {
  return `Hello Sugandhika! 🌿${name ? `\n\nThis is ${name}.` : ''}\n\nI have a query and would like to get in touch.`;
}

/**
 * Open WhatsApp with a pre-filled message
 */
export function openWhatsApp(phone, message) {
  if (!phone) {
    console.warn('WhatsApp phone number not configured');
    return;
  }
  // Strip non-numeric chars (except leading +)
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
}

/**
 * Get a default WhatsApp phone from settings or fallback
 */
export function getWhatsAppPhone(settings) {
  return settings?.whatsappNumber || settings?.phone || '';
}
