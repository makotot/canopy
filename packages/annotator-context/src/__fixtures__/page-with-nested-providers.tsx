import { AuthContext, AuthProvider, useAuth } from './auth-context';

function UserMenu() {
  const { user } = useAuth();
  return <nav>{user.name}</nav>;
}

function InnerSection() {
  return (
    <AuthContext.Provider value={{ user: { name: 'Inner' } }}>
      <UserMenu />
    </AuthContext.Provider>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <InnerSection />
    </AuthProvider>
  );
}
