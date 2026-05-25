import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventCard from '@/app/components/EventCard'
import { apiClient } from '@/lib/api'
import type { Event } from '@/lib/api'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  apiClient: {
    POST: jest.fn(),
    DELETE: jest.fn(),
    PUT: jest.fn(),
  },
}))

const mockPost = apiClient.POST as jest.Mock
const mockDelete = apiClient.DELETE as jest.Mock

const event: Event = {
  id: 1,
  name: 'Team Lunch',
  date: '2026-06-15',
  registrations: 2,
  created_at: '2026-05-01T09:00:00Z',
  updated_at: '2026-05-01T09:00:00Z',
}

beforeEach(() => jest.clearAllMocks())

describe('EventCard', () => {
  it('renders the event name and UK-formatted date', () => {
    render(<EventCard event={event} />)
    expect(screen.getByText('Team Lunch')).toBeInTheDocument()
    expect(screen.getByText('15 June 2026')).toBeInTheDocument()
  })

  it('uses singular "registration" for a count of 1', () => {
    render(<EventCard event={{ ...event, registrations: 1 }} />)
    expect(screen.getByText('1 registration')).toBeInTheDocument()
  })

  it('uses plural "registrations" for a count other than 1', () => {
    render(<EventCard event={event} />)
    expect(screen.getByText('2 registrations')).toBeInTheDocument()
  })

  it('shows a rate-limit message when register returns 429', async () => {
    mockPost.mockResolvedValue({ data: undefined, error: {}, response: { status: 429 } })
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    await user.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() =>
      expect(screen.getByText('Too many requests, please wait a moment.')).toBeInTheDocument()
    )
  })

  it('shows a generic error when register fails with a non-429 status', async () => {
    mockPost.mockResolvedValue({ data: undefined, error: {}, response: { status: 500 } })
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    await user.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() =>
      expect(screen.getByText('Failed to register. Please try again.')).toBeInTheDocument()
    )
  })

  it('shows a rate-limit message when cancel returns 429', async () => {
    mockDelete.mockResolvedValue({ data: undefined, error: {}, response: { status: 429 } })
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(screen.getByText('Too many requests, please wait a moment.')).toBeInTheDocument()
    )
  })

  it('shows edit form pre-filled with current values when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByDisplayValue('Team Lunch')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-06-15')).toBeInTheDocument()
  })

  it('resets name and date state when edit is cancelled so re-opening shows original values', async () => {
    const user = userEvent.setup()
    render(<EventCard event={event} />)
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const nameInput = screen.getByDisplayValue('Team Lunch')
    await user.clear(nameInput)
    await user.type(nameInput, 'Something Else')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByDisplayValue('Team Lunch')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Something Else')).not.toBeInTheDocument()
  })
})
