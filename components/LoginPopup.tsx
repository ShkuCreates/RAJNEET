"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

type PopupType = "welcome" | "interaction" | null;

interface LoginPopupContextType {
  showPopup: (type: PopupType) => void;
  hidePopup: () => void;
}

const LoginPopupContext = createContext<LoginPopupContextType | undefined>(undefined);

export function LoginPopupProvider({ children }: { children: ReactNode }) {
  const [popupType, setPopupType] = useState<PopupType>(null);
  const [welcomeShown, setWelcomeShown] = useState(false);

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('rajneet_welcome_shown');
    if (hasShownWelcome) {
      setWelcomeShown(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!welcomeShown) {
        setPopupType("welcome");
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [welcomeShown]);

  const showPopup = (type: PopupType) => {
    setPopupType(type);
  };

  const hidePopup = () => {
    if (popupType === "welcome") {
      localStorage.setItem('rajneet_welcome_shown', 'true');
      setWelcomeShown(true);
    }
    setPopupType(null);
  };

  return (
    <LoginPopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}
      <AnimatePresence>
        {popupType && (
          <LoginPopup type={popupType} onClose={hidePopup} />
        )}
      </AnimatePresence>
    </LoginPopupContext.Provider>
  );
}

export function useLoginPopup() {
  const context = useContext(LoginPopupContext);
  if (context === undefined) {
    throw new Error("useLoginPopup must be used within a LoginPopupProvider");
  }
  return context;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function LoginPopup({ type, onClose }: { type: PopupType; onClose: () => void }) {
  const isDismissible = type === "welcome";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isDismissible ? onClose : undefined}
        className="absolute inset-0 bg-black/70"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-surface border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        {isDismissible && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-white"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="text-center space-y-4">
          {type === "welcome" ? (
            <>
              <h3 className="text-2xl font-bold text-white">Join the debate</h3>
              <p className="text-muted-foreground">
                Login to share your opinions on India's biggest issues.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white">Login required</h3>
              <p className="text-muted-foreground">
                Login required to participate in public debate.
              </p>
            </>
          )}

          <button
            onClick={() => signIn("google")}
            className="w-full inline-flex items-center justify-center rounded-full bg-accent-blue px-6 py-3 text-base font-bold text-white transition-all hover:bg-accent-blue/90"
          >
            <GoogleIcon />
            Login with Google
          </button>

          {type === "welcome" ? (
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Continue browsing
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
