import { AuthContext } from './auth-context';

function UserName() {
  return <span>User</span>;
}

export default function Page() {
  return (
    <AuthContext.Provider value={{ user: { name: 'Alice' } }}>
      <UserName />
    </AuthContext.Provider>
  );
}
