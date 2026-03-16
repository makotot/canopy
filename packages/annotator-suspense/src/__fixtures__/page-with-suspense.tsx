import { Suspense } from 'react';
import AsyncWidget from './async-widget';

export default function Page() {
  return (
    <main>
      <Suspense fallback={<p>Loading…</p>}>
        <AsyncWidget />
      </Suspense>
    </main>
  );
}
