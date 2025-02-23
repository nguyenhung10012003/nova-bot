'use client';
import { deleteCookie, setCookie } from 'cookies-next';
import { createContext, useCallback, useContext } from 'react';

type Auth = {
  token: string;
  refreshToken: string;
  userId: string;
};

type AuthContextType = {
  signout: () => void;
  setAuth: (auth: Auth) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setAuth = useCallback(({ token, refreshToken, userId }: Auth) => {
    setCookie('user', JSON.stringify({ userId, token, refreshToken }));
  }, []);

  const signout = useCallback(() => {
    deleteCookie('user');
  }, []);

  return (
    <AuthContext.Provider value={{ signout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
