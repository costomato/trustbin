/**
 * Integration tests for /api/classify route
 * Validates: Requirements 2.1, 2.2, 2.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Use vi.hoisted so these are available inside vi.mock factories
const { mockMessagesCreate, mockGetUser } = vi.hoisted(() => ({
  mockMessagesCreate: vi.fn(),
  mockGetUser: vi.fn(),
}))

vi.mock('@/lib/anthropic', () => ({
  anthropic: {
    messages: {
      create: mockMessagesCreate,
    },
  },
  ANTHROPIC_MODEL: 'claude-sonnet-4-20250514',
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    })
  ),
}))

import { POST } from '@/app/api/classify/route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/classify', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as unknown as NextRequest
}

function anthropicResponse(text: string) {
  return {
    content: [{ type: 'text', text }],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/classify', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const res = await POST(makeRequest({ image: 'abc123' }))

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 400 when no image is provided in the body', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('No image provided')
  })

  it('returns classification result when Anthropic returns a valid JSON response', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockMessagesCreate.mockResolvedValueOnce(
      anthropicResponse(
        JSON.stringify({
          classification: 'Recycling',
          explanation: 'Aluminum cans are recyclable.',
          confidence: 'high',
          material_type: 'aluminum_can',
        })
      )
    )

    const res = await POST(makeRequest({ image: 'base64imagedata' }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.classification).toBe('Recycling')
    expect(json.explanation).toBe('Aluminum cans are recyclable.')
    expect(json.confidence).toBe('high')
    expect(json.material_type).toBe('aluminum_can')
  })

  it('returns 500 when Anthropic returns an unparseable response', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockMessagesCreate.mockResolvedValueOnce(
      anthropicResponse('This is not valid JSON at all.')
    )

    const res = await POST(makeRequest({ image: 'base64imagedata' }))

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Failed to parse classification response')
  })

  it('strips data URL prefix from base64 image before sending to Anthropic', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockMessagesCreate.mockResolvedValueOnce(
      anthropicResponse(
        JSON.stringify({
          classification: 'Compost',
          explanation: 'Food waste is compostable.',
          confidence: 'high',
          material_type: 'food_waste',
        })
      )
    )

    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB'
    await POST(makeRequest({ image: dataUrl }))

    expect(mockMessagesCreate).toHaveBeenCalledOnce()
    const callArgs = mockMessagesCreate.mock.calls[0][0]
    const imageBlock = callArgs.messages[0].content[0]
    expect(imageBlock.source.data).toBe('/9j/4AAQSkZJRgAB')
    expect(imageBlock.source.data).not.toContain('data:image')
  })

  it('returns 500 when Anthropic API throws an error', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockMessagesCreate.mockRejectedValueOnce(new Error('API rate limit exceeded'))

    const res = await POST(makeRequest({ image: 'base64imagedata' }))

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Classification failed')
  })
})
