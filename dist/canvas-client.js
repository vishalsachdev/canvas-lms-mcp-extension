"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasClient = exports.CanvasAPIError = void 0;
class CanvasAPIError extends Error {
    status;
    response;
    constructor(message, status, response) {
        super(message);
        this.status = status;
        this.response = response;
        this.name = 'CanvasAPIError';
    }
}
exports.CanvasAPIError = CanvasAPIError;
class CanvasClient {
    config;
    constructor(config) {
        this.config = config;
    }
    async makeRequest(method, endpoint, params, data) {
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
        const headers = {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        const requestInit = {
            method: method.toUpperCase(),
            headers,
        };
        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
            requestInit.body = JSON.stringify(data);
        }
        let lastError = null;
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
                    }
                    catch {
                        // Ignore errors reading response body
                    }
                    throw new CanvasAPIError(errorMessage, response.status, response);
                }
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                let responseData;
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    responseData = await response.json();
                }
                else {
                    responseData = await response.text();
                }
                return {
                    data: responseData,
                    status: response.status,
                    headers: responseHeaders,
                };
            }
            catch (error) {
                lastError = error;
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
        throw new CanvasAPIError(`Request failed after ${this.config.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`, undefined, lastError);
    }
    async get(endpoint, params) {
        return this.makeRequest('GET', endpoint, params);
    }
    async post(endpoint, data, params) {
        return this.makeRequest('POST', endpoint, params, data);
    }
    async put(endpoint, data, params) {
        return this.makeRequest('PUT', endpoint, params, data);
    }
    async patch(endpoint, data, params) {
        return this.makeRequest('PATCH', endpoint, params, data);
    }
    async delete(endpoint, params) {
        return this.makeRequest('DELETE', endpoint, params);
    }
    // Helper method for paginated requests
    async getAllPages(endpoint, params) {
        const allItems = [];
        let nextUrl = endpoint;
        const requestParams = { ...params, per_page: 100 };
        while (nextUrl) {
            const response = await this.get(nextUrl, requestParams);
            allItems.push(...response.data);
            // Check for pagination in Link header
            const linkHeader = response.headers['link'];
            nextUrl = null;
            if (linkHeader) {
                const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                if (nextMatch) {
                    nextUrl = nextMatch[1];
                    // Clear params for subsequent requests as they're in the URL
                    Object.keys(requestParams).forEach(key => delete requestParams[key]);
                }
            }
        }
        return allItems;
    }
}
exports.CanvasClient = CanvasClient;
//# sourceMappingURL=canvas-client.js.map