import React, { createContext, useContext, useState, useEffect } from 'react';
//import { supabase } from '@/integrations/supabase/client';
import{supabase} from '../lib/supabaseClient';
import type { UserInfo } from '@/types/hr';

interface AuthContextType {
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('hr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('USER_INFO')
        .select('*')
        .eq('USER_NAME', username)
        .eq('USER_PASS', password)
        .maybeSingle();

      if (error) {
        return { success: false, error: 'A connection error occurred.' };
      }

      if (!data) {
        return { success: false, error: 'Incorrect username or password.' };
      }

      setUser(data as UserInfo);
      localStorage.setItem('hr_user', JSON.stringify(data));
      return { success: true };
    } catch {
      return { success: false, error: 'A login error occurred.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hr_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
