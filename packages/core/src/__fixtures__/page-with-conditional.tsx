function Dashboard() {
  return <div />;
}

function Login() {
  return <div />;
}

function Banner() {
  return <div />;
}

export default function Page({ isLoggedIn, hasNotif }: { isLoggedIn: boolean; hasNotif: boolean }) {
  return (
    <main>
      {isLoggedIn ? <Dashboard /> : <Login />}
      {hasNotif && <Banner />}
    </main>
  );
}
