import { MessageCircle } from "lucide-react";

type WhatsAppFabProps = {
  href: string;
  label?: string;
};

export function WhatsAppFab({
  href,
  label = "Chat on WhatsApp",
}: WhatsAppFabProps) {
  return (
    <a
      aria-label={label}
      className="whatsapp-fab fixed bottom-5 right-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition hover:bg-[#1ebe57] hover:shadow-[0_12px_34px_rgba(37,211,102,0.55)] sm:right-[max(1rem,calc(50%-280px+1rem))]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span aria-hidden className="whatsapp-fab-ring" />
      <span aria-hidden className="whatsapp-fab-ring whatsapp-fab-ring-delay" />
      <MessageCircle className="relative z-[1]" size={26} strokeWidth={2} />
    </a>
  );
}
