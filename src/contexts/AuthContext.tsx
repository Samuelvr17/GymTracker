import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('gym_tracker_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        // Set user session in database for existing session
        supabase.rpc('set_user_session', { user_uuid: user.id });
      } catch (error) {
        localStorage.removeItem('gym_tracker_user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (username: string, password: string) => {
    // Hash password (simple implementation - in production use proper hashing)
    const passwordHash = btoa(password); // Base64 encoding (not secure for production)
    
    try {
      console.log('Attempting to create user:', { username });
      
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password_hash: passwordHash }])
        .select()
        .single();

      if (error) {
        console.error('Signup database error:', error);
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('El nombre de usuario ya existe');
        }
        throw new Error(`Error al crear la cuenta: ${error.message}`);
      }

      console.log('User created successfully:', data);
      
      // Set user session in database
      await supabase.rpc('set_user_session', { user_uuid: data.id });
      
      const newUser = { id: data.id, username: data.username };
      setUser(newUser);
      localStorage.setItem('gym_tracker_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', { username });
      
      const passwordHash = btoa(password);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        console.error('Signin database error:', error);
        throw new Error('Usuario o contraseña incorrectos');
      }

      console.log('User signed in successfully:', data);
      
      // Set user session in database
      await supabase.rpc('set_user_session', { user_uuid: data.id });
      
      const loggedUser = { id: data.id, username: data.username };
      setUser(loggedUser);
      localStorage.setItem('gym_tracker_user', JSON.stringify(loggedUser));
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('gym_tracker_user');
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}