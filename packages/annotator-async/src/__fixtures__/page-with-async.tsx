import AsyncData from './async-data';
import SyncWidget from './sync-widget';

export default function Page() {
  return (
    <main>
      <AsyncData />
      <SyncWidget />
    </main>
  );
}
