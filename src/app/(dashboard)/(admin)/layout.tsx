export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full">
      <div className="mx-auto max-w-5xl px-4">{children}</div>
    </main>
  );
}
