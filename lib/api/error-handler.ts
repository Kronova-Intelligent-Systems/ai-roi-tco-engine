export class APIError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export function handleAPIError(error: unknown): { error: string; statusCode: number } {
  if (error instanceof APIError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    }
  }

  return {
    error: "An unexpected error occurred",
    statusCode: 500,
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("fetch")
}

export function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: number
  } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options

  return new Promise((resolve, reject) => {
    let attempts = 0

    const attempt = () => {
      attempts++

      fn()
        .then(resolve)
        .catch((error) => {
          if (attempts >= maxAttempts) {
            reject(error)
            return
          }

          const nextDelay = delay * Math.pow(backoff, attempts - 1)
          console.log(`Retry attempt ${attempts} after ${nextDelay}ms`)

          setTimeout(attempt, nextDelay)
        })
    }

    attempt()
  })
}
