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
      console.log('=== SIGNUP ATTEMPT ===');
      console.log('Username:', username);
      console.log('Password length:', password.length);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password_hash: passwordHash }])
        .select()
        .single();

      if (error) {
        console.error('=== SIGNUP DATABASE ERROR ===');
        console.error('Error object:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('El nombre de usuario ya existe');
        }
        throw new Error(`Error al crear la cuenta: ${error.message}`);
      }

      console.log('=== USER CREATED SUCCESSFULLY ===');
      console.log('User data:', data);
      
      // Set user session in database
      console.log('Setting user session...');
      const { data: sessionData, error: sessionError } = await supabase.rpc('set_user_session', { user_uuid: data.id });
      if (sessionError) {
        console.error('SESSION ERROR during signup:', sessionError);
        throw new Error(`Error estableciendo sesión: ${sessionError.message}`);
      }
      console.log('Session set during signup:', sessionData);
      
      const newUser = { id: data.id, username: data.username };
      setUser(newUser);
      localStorage.setItem('gym_tracker_user', JSON.stringify(newUser));
      console.log('=== SIGNUP COMPLETED ===');
    } catch (error) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Error object:', error);
      throw error;
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      console.log('=== SIGNIN ATTEMPT ===');
      console.log('Username:', username);
      
      const passwordHash = btoa(password);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        console.error('=== SIGNIN DATABASE ERROR ===');
        console.error('Error:', error);
        throw new Error('Usuario o contraseña incorrectos');
      }

      console.log('=== USER SIGNED IN SUCCESSFULLY ===');
      console.log('User data:', data);
      
      // Set user session in database
      console.log('Setting user session...');
      const { data: sessionData, error: sessionError } = await supabase.rpc('set_user_session', { user_uuid: data.id });
      if (sessionError) {
        console.error('SESSION ERROR during signin:', sessionError);
        throw new Error(`Error estableciendo sesión: ${sessionError.message}`);
      }
      console.log('Session set during signin:', sessionData);
      
      const loggedUser = { id: data.id, username: data.username };
      setUser(loggedUser);
      localStorage.setItem('gym_tracker_user', JSON.stringify(loggedUser));
      console.log('=== SIGNIN COMPLETED ===');
    } catch (error) {
      console.error('=== SIGNIN ERROR ===');
      console.error('Error object:', error);
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