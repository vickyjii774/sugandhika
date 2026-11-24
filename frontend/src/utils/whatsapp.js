
/**
 * Generate WhatsApp enquiry message for a single product
 */
export function getOrderMessage(product, quantity = 1, price) {
  const displayPrice =
    price ?? product.discountPrice ?? product.price;
  const unitPrice = displayPrice != null ? Number(displayPrice) : null;
  const totalPrice = unitPrice != null ? unitPrice * Number(quantity || 1) : null;
  const formatRs = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

  return `Hello Sugandhika! 🌿

I would like to enquire about this product:

*Product:* ${product.name}
*Quantity:* ${quantity}
*Unit Price:* ${unitPrice != null ? formatRs(unitPrice) : 'Please confirm'}
*Total Price:* ${totalPrice != null ? formatRs(totalPrice) : 'Please confirm'}
${product.selectedVariant ? `*Variant:* ${product.selectedVariant}` : ''}

Please share the product availability and delivery details.

Thank you!`;
}

/**
 * Generate WhatsApp contact/inquiry message
 */
export function getContactMessage(name = '') {
  return `Hello Sugandhika! 🌿${
    name ? `\n\nThis is ${name}.` : ''
  }\n\nI have a query and would like to get in touch.`;
}

/**
 * Open WhatsApp with a pre-filled message
 */
export function openWhatsApp(phone, message) {
  if (!phone) {
    console.warn('WhatsApp phone number not configured');
    return;
  }

  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone) {
    console.warn('WhatsApp phone number is invalid');
    return;
  }

  const encoded = encodeURIComponent(message);
  window.open(
    `https://wa.me/${cleanPhone}?text=${encoded}`,
    '_blank',
    'noopener,noreferrer'
  );
}

/**
 * Get a default WhatsApp phone from settings or fallback
 */
export function getWhatsAppPhone(settings) {
  return settings?.whatsapp || settings?.phone || '';
}
