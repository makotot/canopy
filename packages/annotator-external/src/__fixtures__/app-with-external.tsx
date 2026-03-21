import { Search } from 'lucide-react';
import { Dialog } from '@radix-ui/react-dialog';
import { Header } from './header';

export default function App() {
  return (
    <div>
      <Header />
      <Search />
      <Dialog />
    </div>
  );
}
