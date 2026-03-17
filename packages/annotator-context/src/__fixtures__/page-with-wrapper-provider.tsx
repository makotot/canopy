import { AuthProvider } from './auth-context';

function UserName() {
  return <span>User</span>;
}

export default function Page() {
  return (
    <AuthProvider>
      <UserName />
    </AuthProvider>
  );
}
