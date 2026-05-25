import createClient from 'openapi-fetch'
import type { components, paths } from './api.types'

export type Event = components['schemas']['Event']
export type EventRequest = components['schemas']['EventRequest']


const serverClient = createClient<paths>({
  baseUrl: `${process.env.API_BASE_URL ?? 'http://nginx'}/api`,
  fetch: (input) => fetch(input, { cache: 'no-store' }),
})

export const apiClient = createClient<paths>({ baseUrl: '/api' })

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await serverClient.GET('/events')
  if (error) throw new Error('Failed to fetch events')
  return data.data
}
