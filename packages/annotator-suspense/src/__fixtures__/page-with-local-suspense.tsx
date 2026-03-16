import React from 'react';

function Suspense({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default function Page() {
  return (
    <Suspense>
      <span />
    </Suspense>
  );
}
