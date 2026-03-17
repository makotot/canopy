import { createContext, useContext } from 'react';

interface AuthContextValue {
  user: { name: string };
}

export const AuthContext = createContext<AuthContextValue>({ user: { name: '' } });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: { name: 'Alice' } }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
