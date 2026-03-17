import { use } from 'react';
import { AuthContext, AuthProvider } from './auth-context';

function ProfileBadge() {
  const { user } = use(AuthContext);
  return <span>{user.name}</span>;
}

export default function Page() {
  return (
    <AuthProvider>
      <ProfileBadge />
    </AuthProvider>
  );
}
