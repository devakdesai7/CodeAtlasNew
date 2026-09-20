import axios from 'axios';
import axiosRetry from 'axios-retry';

export class ApiClient {
  private client;
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.client = axios.create({
      timeout: 5000,
    });

    // Configure exponential backoff
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on 5xx or network errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               (error.response ? error.response.status >= 500 : false);
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.warn(`[WARN] Retry attempt ${retryCount} for ${requestConfig.url}. Error: ${error.message}`);
      }
    });
  }

  public async sendPayload(payload: any): Promise<void> {
    try {
      await this.client.post(this.endpoint, payload);
      // Optional: console.log(`[INFO] Successfully sent ${payload.stream_type}`);
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.warn(`[WARN] Endpoint offline, unable to send ${payload.stream_type}.`);
      } else {
        console.error(`[ERROR] Failed to send ${payload.stream_type}: ${error.message}`);
      }
    }
  }
}
