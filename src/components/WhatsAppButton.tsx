import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = "+919963622669"; // Using the primary contact number
  const message = "Hello! I'm interested in your pickles.\n\n🌟 P.S. I want to learn more about your Refer & Earn program to get a 10% lifelong commission!";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300 flex items-center justify-center animate-bounce"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
    </a>
  );
}
