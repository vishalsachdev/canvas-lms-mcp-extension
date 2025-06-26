import { CanvasConfig } from './config.js';

export interface CanvasAPIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class CanvasAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'CanvasAPIError';
  }
}

export class CanvasClient {
  constructor(private config: CanvasConfig) {}

  private async makeRequest<T = any>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    data?: any
  ): Promise<CanvasAPIResponse<T>> {
    // Ensure the base URL ends with /api/v1
    let baseUrl = this.config.apiUrl;
    if (!baseUrl.endsWith('/api/v1') && !baseUrl.endsWith('/api/v1/')) {
      baseUrl = baseUrl.replace(/\/$/, '') + '/api/v1';
    }
    
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, baseUrl + '/');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const requestInit: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
      requestInit.body = JSON.stringify(data);
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.apiTimeout * 1000);

        const response = await fetch(url.toString(), {
          ...requestInit,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `Canvas API error: ${response.status} ${response.statusText}`;
          try {
            const errorBody = await response.text();
            if (errorBody) {
              errorMessage += ` - ${errorBody}`;
            }
          } catch {
            // Ignore errors reading response body
          }
          throw new CanvasAPIError(errorMessage, response.status, response);
        }

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let responseData: T;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          responseData = await response.json() as T;
        } else {
          responseData = await response.text() as T;
        }

        return {
          data: responseData,
          status: response.status,
          headers: responseHeaders,
        };

      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof CanvasAPIError) {
          // Don't retry client errors (4xx)
          if (error.status && error.status >= 400 && error.status < 500) {
            throw error;
          }
        }

        // If this is not the last attempt, wait before retrying
        if (attempt < this.config.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)));
        }
      }
    }

    throw new CanvasAPIError(
      `Request failed after ${this.config.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
      undefined,
      lastError
    );
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<CanvasAPIResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, params);
  }

  async post<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<CanvasAPIResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, params, data);
  }

  async put<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<CanvasAPIResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, params, data);
  }

  async patch<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<CanvasAPIResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, params, data);
  }

  async delete<T = any>(endpoint: string, params?: Record<string, any>): Promise<CanvasAPIResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, params);
  }

  // Helper method for paginated requests
  async getAllPages<T = any>(endpoint: string, params?: Record<string, any>): Promise<T[]> {
    const allItems: T[] = [];
    let nextUrl: string | null = endpoint;
    const requestParams: Record<string, any> = { ...params, per_page: 100 };

    while (nextUrl) {
      const response: CanvasAPIResponse<T[]> = await this.get<T[]>(nextUrl, requestParams);
      allItems.push(...response.data);

      // Check for pagination in Link header
      const linkHeader: string | undefined = response.headers['link'];
      nextUrl = null;
      
      if (linkHeader) {
        const nextMatch: RegExpMatchArray | null = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextMatch) {
          nextUrl = nextMatch[1];
          // Clear params for subsequent requests as they're in the URL
          Object.keys(requestParams).forEach(key => delete (requestParams as any)[key]);
        }
      }
    }

    return allItems;
  }
}