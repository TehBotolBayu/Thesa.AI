// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  logout: () => {},
  refreshUserData: () => {},
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
  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null);
        return null;
      }

      try {
        const { data: userData, error } = await supabase
          .from("Users")
          .select("*")
          .eq("account_id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }

        setProfile(userData);
        return userData;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [supabase]
  );
  const refreshUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchProfile]);
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    logout,
    refreshUserData,
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
