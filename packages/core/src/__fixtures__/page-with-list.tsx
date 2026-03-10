export default function Page({ items }: { items: string[] }) {
  return (
    <main>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
