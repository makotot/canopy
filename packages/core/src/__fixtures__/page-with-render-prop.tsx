import { Suspense } from 'react';

function Loading() {
  return <div>loading</div>;
}

function Content() {
  return <div>content</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
