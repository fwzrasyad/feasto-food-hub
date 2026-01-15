import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define User type
/**
 * User interface defining the structure of an authenticated user.
 * Extends the basic Supabase user with application-specific roles and metadata.
 */
export interface User {
  id: string;
  name: string; // Keep for backward compatibility or display
  email: string;
  role: "admin" | "user" | "vendor";
  username?: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

/**
 * Context Interface for Authentication.
 * Provides access to user state, login/register methods, and session management.
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshLevel: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component.
 * Wraps the application to provide authentication state and logic.
 * 
 * Features:
 * - Persists session using Supabase Auth.
 * - Auto-refreshes user profile data on session changes.
 * - Handles Login, Register, and Logout operations with error handling.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to convert Supabase User to your App User
  const fetchProfile = async (sbUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Fallback to metadata
        return {
          id: sbUser.id,
          email: sbUser.email || "",
          name: sbUser.user_metadata?.name || "User",
          role: sbUser.user_metadata?.role || "user",
          username: sbUser.user_metadata?.username || "",
          full_name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || "",
          avatar_url: "",
          phone_number: "",
        };
      }

      return {
        id: sbUser.id,
        email: sbUser.email || "",
        name: data.full_name || sbUser.user_metadata?.name || "User",
        role: data.role || "user",
        username: data.username,
        full_name: data.full_name,
        phone_number: data.phone_number,
        avatar_url: data.avatar_url,
      };
    } catch (e) {
      console.error("Exception fetching profile:", e);
      return null;
    }
  };

  const refreshLevel = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userProfile = await fetchProfile(session.user);
      setUser(userProfile);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing Auth...");
        // 1. Initial Session Check with Timeout
        // Prevent hanging indefinitely if cookies are weird
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }; error: any }>((_, reject) =>
          setTimeout(() => reject(new Error("Auth Session Timeout")), 3000)
        );

        let sessionData;
        try {
            sessionData = await Promise.race([sessionPromise, timeoutPromise]);
        } catch (e) {
            console.warn("Session check timed out, proceeding as logged out.");
            sessionData = { data: { session: null }, error: null };
        }

        const { data: { session }, error } = sessionData as { data: { session: any }; error: any };
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) setUser(null);
        } else if (session?.user) {
          console.log("Found existing session:", session.user.email);
          const userProfile = await fetchProfile(session.user);
          if (mounted) {
             // Basic deep check to avoid re-renders if nothing changed
             setUser((prev) => {
                 if (JSON.stringify(prev) === JSON.stringify(userProfile)) return prev;
                 return userProfile;
             });
          }
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Message:", event);
      
      // If we are already loading, let the initial check finish to avoid state thrashing
      // Unless it's a SIGN_OUT event which should be immediate
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          const userProfile = await fetchProfile(session.user);
          if (mounted) {
            setUser(userProfile);
            setLoading(false); // Ensure loading stops
          }
        }
      }
    });

    // 3. Handle Tab Visibility/Resume
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, verifying session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.warn("Session invalid on resume:", error);
          if (mounted) setUser(null);
        } else if (session?.user && mounted) {
           // Optional: You could re-fetch profile here if you suspect it changes often,
           // but normally just ensuring the session is valid is enough to fix the token.
           console.log("Session verified on resume.");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Login error object:", error);
      toast.error(error.message);
      throw error;
    }
    toast.success("Welcome back!");
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }, // Saves custom data
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Account created! You can now log in.");
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else toast.info("Logged out");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading, refreshLevel }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};