import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="app-shell">
      <h1>Page not found</h1>
      <p>This URL does not exist.</p>
      <p>
        <Link href="/">Back to home</Link>
      </p>
    </main>
  );
}
