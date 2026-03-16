import React from 'react';
import AsyncWidget from './async-widget';

export default function Page() {
  return (
    <main>
      <React.Suspense fallback={<p>Loading…</p>}>
        <AsyncWidget />
      </React.Suspense>
    </main>
  );
}
