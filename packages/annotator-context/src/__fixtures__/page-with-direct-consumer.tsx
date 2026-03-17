import { useContext } from 'react';
import { AuthContext, AuthProvider } from './auth-context';

function UserMenu() {
  const { user } = useContext(AuthContext);
  return <nav>{user.name}</nav>;
}

export default function Page() {
  return (
    <AuthProvider>
      <UserMenu />
    </AuthProvider>
  );
}
