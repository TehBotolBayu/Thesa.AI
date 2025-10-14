// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
});

export const AuthProvider = ({
  children,
  serverUser,
  serverProfile,
  serverSession,
}) => {
  const supabase = createClient();
  // Initialize state with the secure, server-validated user data
  const [user, setUser] = useState(serverUser);
  const [profile, setProfile] = useState(serverProfile);
  const [session, setSession] = useState(serverSession);
  const [isLoading, setIsLoading] = useState(false); // We have server data, so not loading initially

  useEffect(() => {
    // This listener is for real-time UI updates (e.g., login in another tab)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      // Here we can use the newSession for quick UI updates,
      // but for a full refresh, we re-fetch the user and profile
      if (newSession?.user?.id !== user?.id) {
        // A different user has signed in/out, re-fetch everything
        const {
          data: { user: authedUser },
        } = await supabase.auth.getUser();
        setUser(authedUser);

        if (authedUser) {
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authedUser.id)
            .single();
          setProfile(newProfile);
        } else {
          setProfile(null);
        }
      }
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, user]); // Rerun effect if the user state changes

  const value = {
    user,
    profile,
    session,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
