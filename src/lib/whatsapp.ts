const fallbackWhatsAppHref = "https://wa.me/5511953583354";

export function getWhatsAppHref() {
  return process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || fallbackWhatsAppHref;
}
