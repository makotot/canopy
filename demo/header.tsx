import UserMenu from './user-menu';

export default function Header() {
  return (
    <header>
      <nav>
        <a href="/">Dashboard</a>
      </nav>
      <UserMenu />
    </header>
  );
}
