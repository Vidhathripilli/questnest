'use client';

import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  return (
    <AuthContext.Provider value={{ isSignUp, setIsSignUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}