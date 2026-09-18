import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
