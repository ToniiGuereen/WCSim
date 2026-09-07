import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WorldCupApiService {
  /** Provides low-level HTTP GET/POST helpers against the World Cup API base url. */
  private readonly baseUrl: string;
  private readonly basePath: string;
  private readonly apiKey: string;

  /** Reads base url and base path from environment configuration. */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WORLD_CUP_API_URL', 'http://localhost:5101');
    this.basePath = this.configService.get<string>('WORLD_CUP_API_BASE_PATH', '/worldCup');
    this.apiKey = this.configService.get<string>('WORLD_CUP_API_KEY', '');
  }

  /** Executes a GET request to a World Cup API endpoint path. */
  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
    const requestParams = this.buildParams(params);
    const response = await firstValueFrom(
      this.httpService.get<T>(this.buildUrl(path), {
        params: requestParams,
        headers: this.buildHeaders(),
      }),
    );

    return response.data;
  }

  /** Executes a POST request to a World Cup API endpoint path. */
  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.post<T>(this.buildUrl(path), body ?? {}, {
        params: this.buildParams(),
        headers: this.buildHeaders(),
      }),
    );

    return response.data;
  }

  /** Builds headers including API key if available. */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /** Builds params including API key for WorldCupAPI.com if available. */
  private buildParams(additionalParams?: Record<string, string>): Record<string, string> {
    const params: Record<string, string> = { ...additionalParams };

    // For WorldCupAPI.com, API key is passed as query parameter
    if (this.apiKey && !params['key']) {
      params['key'] = this.apiKey;
    }

    return params;
  }

  /** Builds a full url from configured base path and endpoint path. */
  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const normalizedBasePath = this.basePath.startsWith('/') ? this.basePath : `/${this.basePath}`;
    return `${this.baseUrl}${normalizedBasePath}${normalizedPath}`;
  }
}
