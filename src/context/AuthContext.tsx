import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "vendor";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        // Fallback to metadata if profile fetch fails (though it shouldn't)
        return {
          id: sbUser.id,
          email: sbUser.email || "",
          name: sbUser.user_metadata?.name || "User",
          role: sbUser.user_metadata?.role || "user",
        };
      }

      return {
        id: sbUser.id,
        email: sbUser.email || "",
        name: data.full_name || sbUser.user_metadata?.name || "User",
        role: data.role || "user",
      };
    } catch (e) {
      console.error("Exception fetching profile:", e);
      return null;
    }
  };

  useEffect(() => {
    // 1. Check Active Session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userProfile = await fetchProfile(session.user);
        setUser(userProfile);
      }
      setLoading(false);
    };

    checkSession();

    // 2. Listen for Auth Changes (Login/Logout/Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // We might be loading again if switching users
        const userProfile = await fetchProfile(session.user);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
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
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
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