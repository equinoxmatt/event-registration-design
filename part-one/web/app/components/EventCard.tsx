'use client'

import { useOptimistic, useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import type { Event } from '@/lib/api'

export default function EventCard({ event }: { event: Event }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [optimisticEvent, setOptimisticEvent] = useOptimistic(event)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(event.name)
  const [date, setDate] = useState(event.date)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  async function register() {
    setError(null)
    setOptimisticEvent({ ...optimisticEvent, registrations: optimisticEvent.registrations + 1 })
    const { error, response } = await apiClient.POST('/events/{id}/register', {
      params: { path: { id: event.id } },
    })
    if (error) {
      setError(response.status === 429 ? 'Too many requests, please wait a moment.' : 'Failed to register. Please try again.')
      return
    }
    router.refresh()
  }

  async function cancelRegistration() {
    setError(null)
    setOptimisticEvent({ ...optimisticEvent, registrations: Math.max(0, optimisticEvent.registrations - 1) })
    const { error, response } = await apiClient.DELETE('/events/{id}/register', {
      params: { path: { id: event.id } },
    })
    if (error) {
      setError(response.status === 429 ? 'Too many requests, please wait a moment.' : 'Failed to cancel. Please try again.')
      return
    }
    router.refresh()
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const { error } = await apiClient.PUT('/events/{id}', {
        params: { path: { id: event.id } },
        body: { name, date },
      })

      if (error) {
        const message = typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : null
        setError(message ?? 'Failed to update event.')
        return
      }

      setEditing(false)
      router.refresh()
    })
  }

  async function handleDelete() {
    setError(null)

    startTransition(async () => {
      const { error } = await apiClient.DELETE('/events/{id}', {
        params: { path: { id: event.id } },
      })
      if (error) {
        setError('Failed to delete event.')
        return
      }
      router.refresh()
    })
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            disabled={isPending}
            className="min-w-0 flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-40"
          />
          <input
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
            Save
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setName(event.name); setDate(event.date) }}
            disabled={isPending}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-900">{optimisticEvent.name}</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{formattedDate}</p>
          <p className="mt-1 text-sm font-medium text-zinc-700">
            {optimisticEvent.registrations} {optimisticEvent.registrations === 1 ? 'registration' : 'registrations'}
          </p>
        </div>
        <div className="ml-6 flex shrink-0 gap-2">
          <button
            onClick={() => startTransition(register)}
            disabled={isPending}
            aria-label={`Register for ${event.name}`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            Register
          </button>
          <button
            onClick={() => startTransition(cancelRegistration)}
            disabled={isPending}
            aria-label={`Cancel registration for ${event.name}`}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => setEditing(true)}
            disabled={isPending}
            aria-label={`Edit ${event.name}`}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40"
          >
            Edit
          </button>
          <button
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={isPending}
            aria-label={`Delete ${event.name}`}
            className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      <dialog
        ref={deleteDialogRef}
        aria-labelledby={`delete-dialog-title-${event.id}`}
        aria-describedby={`delete-dialog-desc-${event.id}`}
        aria-modal="true"
        className="m-auto rounded-lg border border-zinc-200 bg-white p-6 shadow-lg [&::backdrop]:bg-zinc-900/50"
      >
        <p id={`delete-dialog-title-${event.id}`} className="text-sm font-medium text-zinc-900">Delete &ldquo;{event.name}&rdquo;?</p>
        <p id={`delete-dialog-desc-${event.id}`} className="mt-1 text-sm text-zinc-500">This cannot be undone</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => deleteDialogRef.current?.close()}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              deleteDialogRef.current?.close()
              startTransition(handleDelete)
            }}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Delete
          </button>
        </div>
      </dialog>
    </div>
  )
}
