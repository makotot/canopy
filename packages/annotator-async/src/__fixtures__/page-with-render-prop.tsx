import { Suspense } from 'react';
import Loading from './loading';
import AsyncData from './async-data';

export default function Page() {
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <AsyncData />
      </Suspense>
    </main>
  );
}
