/**
 * Auth error case unit tests
 * Validates: Requirements 1.3, 1.5
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock next/navigation before importing components
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  redirect: vi.fn(),
}))

// Mock the supabase client module
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

// Import components after mocks are set up
import RegisterPage from '@/app/(auth)/register/page'
import LoginPage from '@/app/(auth)/login/page'

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Register page tests
// ---------------------------------------------------------------------------

describe('RegisterPage', () => {
  async function fillAndSubmitRegisterForm(email = 'test@asu.edu', password = 'password123') {
    render(React.createElement(RegisterPage))
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }))
  }

  it('shows "already registered" message when signUp returns a duplicate email error', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered', status: 400 },
    })

    await fillAndSubmitRegisterForm()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'This email is already registered'
      )
    })
  })

  it('shows "already registered" message when signUp returns a 422 status', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email address is already taken', status: 422 },
    })

    await fillAndSubmitRegisterForm()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'This email is already registered'
      )
    })
  })

  it('shows the raw error message for a generic signUp error', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Signup is disabled for this project', status: 500 },
    })

    await fillAndSubmitRegisterForm()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Signup is disabled for this project'
      )
    })
  })

  it('redirects to dashboard on successful registration', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: {} }, error: null })

    await fillAndSubmitRegisterForm()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Login page tests
// ---------------------------------------------------------------------------

describe('LoginPage', () => {
  async function fillAndSubmitLoginForm(email = 'test@asu.edu', password = 'wrongpassword') {
    render(React.createElement(LoginPage))
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.submit(screen.getByRole('button', { name: /log in/i }))
  }

  it('shows "Invalid email or password" when signInWithPassword returns an error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials', status: 400 },
    })

    await fillAndSubmitLoginForm()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password')
    })
  })

  it('redirects to dashboard on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: { user: {} }, error: null })

    await fillAndSubmitLoginForm('test@asu.edu', 'correctpassword')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
