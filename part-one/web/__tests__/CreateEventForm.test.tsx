import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CreateEventForm from '@/app/components/CreateEventForm'
import { apiClient } from '@/lib/api'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  apiClient: {
    POST: jest.fn(),
  },
}))

const mockPost = apiClient.POST as jest.Mock

beforeEach(() => jest.clearAllMocks())

describe('CreateEventForm', () => {
  it('renders name and date inputs with a Create button', () => {
    render(<CreateEventForm />)
    expect(screen.getByPlaceholderText('Event name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('shows the message from the API error on failure', async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { message: 'The name field is required.' },
      response: { status: 422 },
    })
    const { container } = render(<CreateEventForm />)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() =>
      expect(screen.getByText('The name field is required.')).toBeInTheDocument()
    )
  })

  it('shows a generic error when the API error has no message', async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: 'Internal Server Error',
      response: { status: 500 },
    })
    const { container } = render(<CreateEventForm />)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() =>
      expect(screen.getByText('Failed to create event.')).toBeInTheDocument()
    )
  })
})
