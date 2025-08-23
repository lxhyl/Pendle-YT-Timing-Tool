import { apiRequest, ApiError } from './utils'
import type { RequestConfig } from './utils'


// Market data type
export interface Market {
    name: string
    address: number
    expiry: string
    pt:string,
    yt:string,
    sy:string,
    underlyingAsset:string
}

// Pendle API base URL
const BASE_URL = "https://api-v2.pendle.finance/core"

// Pendle-specific error type
export class PendleApiError extends ApiError {
  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: any
  ) {
    super(message, status, code, details)
    this.name = 'PendleApiError'
  }
}



// Get active markets
export async function getActiveMarkets(
  chainId: number,
  config?: RequestConfig
): Promise<Market[]> {
  try {
    const url = `${BASE_URL}/v1/${chainId}/markets/active`
    const data = await apiRequest<{markets:Market[]}>(url, config)
    return data.markets
  } catch (error) {
    console.error('Failed to get active markets:', error)
    throw new PendleApiError(
      error instanceof ApiError ? error.message : 'Failed to get active markets',
      error instanceof ApiError ? error.status : 500,
      error instanceof ApiError ? error.code : 'UNKNOWN_ERROR'
    )
  }
}
