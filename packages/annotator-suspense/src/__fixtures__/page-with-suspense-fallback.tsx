import { Suspense } from 'react';
import AsyncWidget from './async-widget';
import Spinner from './spinner';

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <AsyncWidget />
    </Suspense>
  );
}
