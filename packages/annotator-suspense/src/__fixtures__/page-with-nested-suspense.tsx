import { Suspense } from 'react';
import AsyncWidget from './async-widget';
import Spinner from './spinner';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<p>Loading 1</p>}>
        <AsyncWidget />
      </Suspense>
      <Suspense fallback={<p>Loading 2</p>}>
        <Spinner />
      </Suspense>
    </div>
  );
}
