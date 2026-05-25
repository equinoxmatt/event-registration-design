'use client'

export default function Error() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">Events</h1>
      <p role="alert" className="text-sm text-red-600">Unable to load events. Please try again later.</p>
    </main>
  )
}
