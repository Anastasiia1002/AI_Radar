export type FreeSerpErrorCode = 'network' | 'http' | 'api' | 'invalid' | 'aborted'

export class FreeSerpError extends Error {
  readonly code: FreeSerpErrorCode
  readonly status: number | null

  constructor(code: FreeSerpErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'FreeSerpError'
    this.code = code
    this.status = status ?? null
  }
}

export function abortedError(): FreeSerpError {
  return new FreeSerpError('aborted', 'The request was aborted.')
}

export function isAbortError(error: unknown): boolean {
  if (error instanceof FreeSerpError && error.code === 'aborted') return true
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name?: unknown }).name === 'AbortError'
}

export function toIndexErrorMessage(error: unknown): string {
  if (isAbortError(error)) return 'The request was cancelled.'
  return "We couldn't reach the AI index."
}
