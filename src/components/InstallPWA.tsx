"use client";

import { useEffect, useState } from "react";

const AddToHomeButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Detect if the user is on a mobile device
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Listen for the beforeinstallprompt event
    const handler = (e: any) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA install");
        }
        setDeferredPrompt(null);
        setShowButton(false);
      });
    }
  };

  if (!isMobile || !showButton) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      Add to Home Screen
    </button>
  );
};

export default AddToHomeButton;
