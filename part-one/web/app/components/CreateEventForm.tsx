'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

export default function CreateEventForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const { error } = await apiClient.POST('/events', {
        body: { name, date },
      })

      if (error) {
        const message = typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : null
        setError(message ?? 'Failed to create event.')
        return
      }

      setName('')
      setDate('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">New event</h2>
      <div className="flex gap-3">
        <label htmlFor="new-event-name" className="sr-only">Event name</label>
        <input
          id="new-event-name"
          type="text"
          placeholder="Event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
          disabled={isPending}
          className="min-w-0 flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-40"
        />
        <label htmlFor="new-event-date" className="sr-only">Event date</label>
        <input
          id="new-event-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={isPending}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          Create
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}
