import { getWhatsAppHref } from "../../lib/whatsapp";

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.02 3.2A12.72 12.72 0 0 0 5.08 22.4L3.6 28.8l6.55-1.46A12.72 12.72 0 1 0 16.02 3.2Zm0 2.36a10.36 10.36 0 0 1 8.8 15.82 10.38 10.38 0 0 1-13.86 3.7l-.47-.25-3.86.86.88-3.78-.28-.49a10.36 10.36 0 0 1 8.79-15.86Zm-4.08 4.94c-.22 0-.58.08-.89.42-.3.33-1.17 1.14-1.17 2.78 0 1.63 1.2 3.22 1.36 3.44.17.22 2.32 3.72 5.75 5.06 2.85 1.12 3.43.9 4.05.84.62-.06 2.02-.82 2.3-1.62.29-.8.29-1.49.2-1.63-.08-.14-.31-.22-.65-.39-.34-.17-2.02-1-2.33-1.11-.31-.11-.54-.17-.77.17-.22.34-.88 1.11-1.08 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.75-1.69-1.02-.91-1.7-2.03-1.9-2.37-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.43-.03-.6-.08-.17-.76-1.84-1.05-2.52-.27-.65-.55-.57-.77-.58h-.49Z" />
    </svg>
  );
}

export function WhatsAppFloatingButton() {
  return (
    <a
      href={getWhatsAppHref()}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com Thais Monteiro pelo WhatsApp"
      className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_34px_rgba(36,35,31,0.24)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/70 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
