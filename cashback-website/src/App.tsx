import { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MerchantList from "./pages/MerchantList";
import MerchantDetails from "./pages/MerchantDetails";
import Profile from "./pages/Profile";
import { Toaster } from "sonner";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

function App() {
  // Initialize state from history to handle page refreshes
  const [selectedCardId, setSelectedCardId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.history.state) {
      return window.history.state.cardId || null;
    }
    return null;
  });

  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.history.state) {
      return window.history.state.merchantId || null;
    }
    return null;
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      setSelectedCardId(state?.cardId || null);
      setSelectedMerchantId(state?.merchantId || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleCardSelect = (cardId: string) => {
    const newState = { cardId, merchantId: null };
    // URL remains '/' but history entry is added
    window.history.pushState(newState, '', '/');
    setSelectedCardId(cardId);
    setSelectedMerchantId(null);
    window.scrollTo(0, 0);
  };

  const handleMerchantSelect = (merchantId: string) => {
    const newState = { cardId: selectedCardId, merchantId };
    window.history.pushState(newState, '', '/');
    setSelectedMerchantId(merchantId);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    // Navigate back in browser history
    // This will trigger popstate, which updates the state
    window.history.back();
  };


  const [view, setView] = useState<'main' | 'profile'>('main');

  const [user, setUser] = useState<{ name: string; email: string; picture?: string } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Track demo mode to prevent Supabase from clearing state
  const isDemoRef = useRef(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        isDemoRef.current = false;
        setUser({
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
        });
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (session?.user) {
        isDemoRef.current = false;
        setUser({
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
        });
        setIsLoginOpen(false);
      } else {
        // Only clear if NOT in demo mode
        if (!isDemoRef.current) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user: { name: string; email: string; picture?: string }) => {
    if (user.email === 'demo@example.com') {
      isDemoRef.current = true;
      localStorage.setItem('demo_mode', 'true');
      setUser(user);
      setIsLoginOpen(false);
    }
  };

  const handleLogout = async () => {
    if (isDemoRef.current) {
      isDemoRef.current = false;
      localStorage.removeItem('demo_mode');
      setUser(null);
    } else {
      await supabase.auth.signOut();
      // Auth listener will handle cleanup
    }
    setView('main');
    window.history.pushState(null, '', '/');
  };

  const handleProfileClick = () => {
    setView('profile');
    setSelectedCardId(null);
    setSelectedMerchantId(null);
    // Keep URL clean, just update state for history navigation
    window.history.pushState({ view: 'profile' }, '', '/');
    window.scrollTo(0, 0);
  };

  const handleLogoClick = () => {
    setView('main');
    handleCardSelect(null!);
  };

  // Enhance handlePopState to handle profile view
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.view === 'profile') {
        setView('profile');
        setSelectedCardId(null);
        setSelectedMerchantId(null);
      } else {
        setView('main');
        setSelectedCardId(state?.cardId || null);
        setSelectedMerchantId(state?.merchantId || null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="backcash-theme">
      <Layout
        onLogoClick={handleLogoClick}
        onProfileClick={handleProfileClick}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoginOpen={isLoginOpen}
        onOpenLogin={() => setIsLoginOpen(true)}
        onCloseLogin={() => setIsLoginOpen(false)}
      >
        {view === 'profile' && user ? (
          <Profile onBack={handleBack} user={user} />
        ) : selectedMerchantId && selectedCardId ? (
          <MerchantDetails
            merchantId={selectedMerchantId}
            onBack={handleBack}
            isAuthenticated={!!user}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        ) : selectedCardId ? (
          <MerchantList
            cardId={selectedCardId}
            onBack={handleBack}
            onMerchantSelect={handleMerchantSelect}
            isAuthenticated={!!user}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        ) : (
          <Home onCardSelect={handleCardSelect} />
        )}
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
