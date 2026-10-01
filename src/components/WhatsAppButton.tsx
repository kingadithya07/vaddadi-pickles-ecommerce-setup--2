import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = "918008129309"; // Using the primary contact number
  const message = "Hello! I'm interested in your pickles.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300 flex items-center justify-center animate-bounce"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
