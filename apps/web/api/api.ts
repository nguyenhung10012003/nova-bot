import { getCookie } from 'cookies-next';
import { redirect } from 'next/navigation';

type RequestInterceptor = (config: RequestInit) => Promise<RequestInit>;
type ResponseSuccessInterceptor<DataType = any> = (
  response: Response,
) => Promise<DataType>;
type ResponseErrorInterceptor<ErrorType = any> = (
  error: ErrorType,
) => Promise<any>;

type RequestInitWithNext = RequestInit & {
  next?: NextFetchRequestConfig;
};

type ResponseType<DataType = any, ErrorType = any> = DataType | ErrorType;

type APICreateOptions = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export class API {
  private static instance: API;
  private headers: Headers;
  private baseUrl: string;
  public interceptors = {
    request: {
      use: (interceptor: RequestInterceptor) => {
        this.requestInterceptors.push(interceptor);
      },
    },
    response: {
      use: (
        successInterceptor: ResponseSuccessInterceptor,
        errorInterceptor?: ResponseErrorInterceptor,
      ) => {
        this.responseInterceptors.push({
          successInterceptor,
          errorInterceptor,
        });
      },
    },
  };

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: {
    successInterceptor: ResponseSuccessInterceptor;
    errorInterceptor?: ResponseErrorInterceptor;
  }[] = [];

  private constructor(options?: APICreateOptions) {
    this.baseUrl = options?.baseUrl || '';
    this.headers = new Headers(options?.headers);
  }

  static getInstance(options?: APICreateOptions): API {
    if (!API.instance) {
      API.instance = new API(options);
    }
    return API.instance;
  }

  async request<DataType = any, ErrorType = any>(
    input: string,
    init: RequestInitWithNext = {},
  ): Promise<ResponseType<DataType, ErrorType>> {
    init.headers = {
      ...Object.fromEntries(this.headers.entries()),
      ...(init.headers || {}),
    };

    for (const interceptor of this.requestInterceptors) {
      init = await interceptor(init);
    }

    try {
      let response = await fetch(`${this.baseUrl}${input}`, init);

      if (!response.ok) {
        throw response;
      }

      for (const { successInterceptor } of this.responseInterceptors) {
        response = await successInterceptor(response);
      }

      return response as DataType;
    } catch (error) {
      for (const { errorInterceptor } of this.responseInterceptors) {
        if (errorInterceptor) {
          error = await errorInterceptor(error);
        }
      }
      return error as ErrorType;
    }
  }

  async get<DataType = any, ErrorType = any>(
    url: string,
    init?: RequestInitWithNext,
  ): Promise<ResponseType<DataType, ErrorType>> {
    return this.request<DataType, ErrorType>(url, { ...init, method: 'GET' });
  }

  async post<DataType = any, ErrorType = any>(
    url: string,
    body?: any,
    init?: RequestInitWithNext,
  ): Promise<ResponseType<DataType, ErrorType>> {
    return this.request<DataType, ErrorType>(url, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
  }

  async put<DataType = any, ErrorType = any>(
    url: string,
    body?: any,
    init?: RequestInitWithNext,
  ): Promise<ResponseType<DataType, ErrorType>> {
    return this.request<DataType, ErrorType>(url, {
      ...init,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
  }

  async patch<DataType = any, ErrorType = any>(
    url: string,
    body?: any,
    init?: RequestInitWithNext,
  ): Promise<ResponseType<DataType, ErrorType>> {
    return this.request<DataType, ErrorType>(url, {
      ...init,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
  }

  async delete<DataType = any, ErrorType = any>(
    url: string,
    init?: RequestInitWithNext,
  ): Promise<ResponseType<DataType, ErrorType>> {
    return this.request<DataType, ErrorType>(url, {
      ...init,
      method: 'DELETE',
    });
  }
}

const isServer = typeof window === 'undefined';

export const api = API.getInstance({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies } = await import('next/headers'),
      user = JSON.parse(cookies().get('user')?.value || 'null');
    if (user && user.token) {
      if (!config.headers) {
        config.headers = {};
      }
      (config.headers as Record<string, string>)['Authorization'] =
        `Bearer ${user.token}`;
    }
  } else {
    const user = JSON.parse((await getCookie('user')) || 'null');
    const token = user?.token;
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] =
        `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  async (response) => {
    if (response.headers.get('content-length') === '0') {
      return {
        error: null,
      };
    }
    return response.json()
  },
  async (error) => {
    console.error('Error fetch: ', error);
    if (error.status === 401) {
      if (isServer) {
        redirect('/logout');
      } else {
        window.location.href = '/logout';
      }
    }

    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: 'unknown error' };
    }
  },
);
