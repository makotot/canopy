import { AuthProvider, useAuth } from './auth-context';

function SignOutButton() {
  const { user } = useAuth();
  return <button>{user.name}</button>;
}

export default function Page() {
  return (
    <AuthProvider>
      <SignOutButton />
    </AuthProvider>
  );
}
