function Fallback() {
  return <div>fallback</div>;
}

export default function Page({ content }: { content: React.ReactNode }) {
  return <main>{content || <Fallback />}</main>;
}
