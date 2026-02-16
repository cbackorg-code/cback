import { useState, useEffect, useRef } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MerchantList from "./pages/MerchantList";
import MerchantDetails from "./pages/MerchantDetails";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import DocsPage from "./pages/DocsPage";
import { Toaster } from "sonner";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

import { api } from "./lib/api";

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


  const [view, setView] = useState<'main' | 'profile' | 'public_profile' | 'docs'>('main');
  const [publicProfileId, setPublicProfileId] = useState<string | null>(null);

  const [user, setUser] = useState<{ name: string; email: string; avatar_url?: string; reputation?: number } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Track demo mode to prevent Supabase from clearing state
  const isDemoRef = useRef(false);

  useEffect(() => {
    // Helper to sync user data
    const syncUser = async (sessionUser: any) => {
      const basicUser = {
        name: sessionUser.user_metadata.full_name || sessionUser.user_metadata.name || sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
        avatar_url: sessionUser.user_metadata.avatar_url || sessionUser.user_metadata.picture,
        reputation: 0 // Default
      };

      // Fetch extended profile data (reputation)
      try {
        const profile = await api.getProfile();
        setUser({
          ...basicUser,
          reputation: profile.reputation_score,
          // Prefer profile avatar if available (might differ from auth provider)
          avatar_url: profile.avatar_url || basicUser.avatar_url
        });
      } catch (e) {
        console.error("Failed to fetch extended profile", e);
        setUser(basicUser);
      }
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        isDemoRef.current = false;
        syncUser(session.user);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (session?.user) {
        isDemoRef.current = false;
        localStorage.removeItem('demo_mode');
        syncUser(session.user);
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

  const handlePublicProfileClick = (userId: string) => {
    setPublicProfileId(userId);
    setView('public_profile');
    window.history.pushState({ view: 'public_profile', userId }, '', '/');
    window.scrollTo(0, 0);
  };

  const handleDocsClick = () => {
    setView('docs');
    window.history.pushState({ view: 'docs' }, '', '/');
    window.scrollTo(0, 0);
  }

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
      } else if (state?.view === 'public_profile') {
        setView('public_profile');
        setPublicProfileId(state.userId);
        setSelectedCardId(null);
        setSelectedMerchantId(null);
      } else if (state?.view === 'docs') {
        setView('docs');
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
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="backcash-theme">
        <Layout
          onLogoClick={handleLogoClick}
          onProfileClick={handleProfileClick}
          user={user}
          onLogout={handleLogout}
          isLoginOpen={isLoginOpen}
          onOpenLogin={() => setIsLoginOpen(true)}
          onCloseLogin={() => setIsLoginOpen(false)}
          onDocsClick={handleDocsClick}
        >
          {view === 'profile' && user ? (
            <Profile onBack={handleBack} user={user} />
          ) : view === 'public_profile' && publicProfileId ? (
            <PublicProfile userId={publicProfileId} onBack={handleBack} />
          ) : view === 'docs' ? (
            <DocsPage onBack={handleBack} />
          ) : selectedMerchantId && selectedCardId ? (
            <MerchantDetails
              merchantId={selectedMerchantId}
              onBack={handleBack}
              isAuthenticated={!!user}
              onOpenLogin={() => setIsLoginOpen(true)}
              onUserClick={handlePublicProfileClick}
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
    </HelmetProvider>
  );
}

export default App;
