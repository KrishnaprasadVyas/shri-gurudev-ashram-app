import { getFriendlyApiError } from '../utils/apiErrors'

describe('getFriendlyApiError', () => {
  it('translates Firebase too-many-requests code', () => {
    const error = new Error('[auth/too-many-requests] We have blocked all requests from this device.')
    const msg = getFriendlyApiError(error)
    expect(msg).toContain('Multiple sign-in attempts detected')
  })

  it('translates Firebase invalid-verification-code code', () => {
    const error = new Error('auth/invalid-verification-code: Code is wrong')
    const msg = getFriendlyApiError(error)
    expect(msg).toContain('verification code you entered is incorrect')
  })

  it('translates Firebase code-expired code', () => {
    const error = new Error('auth/code-expired: The OTP has expired')
    const msg = getFriendlyApiError(error)
    expect(msg).toContain('verification code has expired')
  })

  it('translates network request failed error', () => {
    const error = new TypeError('Network request failed')
    const msg = getFriendlyApiError(error)
    expect(msg).toContain('Unable to connect to the Ashram servers')
  })

  it('translates AbortError timeout', () => {
    const error = new Error('The user aborted a request.')
    error.name = 'AbortError'
    const msg = getFriendlyApiError(error)
    expect(msg).toContain('The request took longer than expected')
  })

  it('translates Razorpay user cancellation', () => {
    const error = { message: 'Payment cancelled by user' }
    const msg = getFriendlyApiError(error)
    expect(msg).toContain('Payment was cancelled')
  })

  it('filters technical jargon and uses fallback message', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: 'Unexpected token < in JSON at position 0' },
      },
    }
    const msg = getFriendlyApiError(error, 'Fallback message')
    expect(msg).toContain('temporarily experiencing high load')
  })

  it('preserves clean user-facing validation messages from server', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Donation amount must be between INR 10 and INR 10,000,000' },
      },
    }
    const msg = getFriendlyApiError(error)
    expect(msg).toBe('Donation amount must be between INR 10 and INR 10,000,000')
  })

  it('applies custom overrides first', () => {
    const error = new Error('Custom specific error')
    const msg = getFriendlyApiError(error, 'Default fallback', [
      { match: /custom/i, message: 'Custom friendly explanation' },
    ])
    expect(msg).toBe('Custom friendly explanation')
  })

  it('returns fallback message for generic unknown exceptions', () => {
    const error = new Error('something_completely_unknown')
    const msg = getFriendlyApiError(error, 'Default fallback message')
    expect(msg).toBe('Default fallback message')
  })
})
