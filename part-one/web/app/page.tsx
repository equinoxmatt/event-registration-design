import { fetchEvents } from '@/lib/api'
import EventCard from '@/app/components/EventCard'
import CreateEventForm from '@/app/components/CreateEventForm'

export default async function HomePage() {
  const events = await fetchEvents()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Events</h1>
      <CreateEventForm />
      {events.length === 0 ? (
        <p className="text-sm text-zinc-500">No events scheduled.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
