import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if we should show the prompt (e.g., if user dismissed it recently, maybe don't show)
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (lastDismissed) {
        const timeSinceDismissed = Date.now() - parseInt(lastDismissed, 10);
        // If dismissed less than 24 hours ago, don't show
        if (timeSinceDismissed < 24 * 60 * 60 * 1000) {
          return;
        }
      }
      
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that the user dismissed it, don't bug them for 24 hours
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-[60] animate-slide-up sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-900">Install Vaddadi Pickles</h3>
              <p className="text-sm text-gray-500">Fast access & better experience!</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 w-full mt-2">
          <button 
            onClick={handleInstallClick}
            className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
          >
            <Download size={18} />
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
