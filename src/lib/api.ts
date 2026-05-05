import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next/types';
import Cookies from 'universal-cookie';

import { getToken, removeToken, removeRefreshToken } from '@/lib/cookies';

import { UninterceptedApiError } from '@/types/api';
const context = <GetServerSidePropsContext>{};

const rawBaseURL =
  process.env.NEXT_PUBLIC_RUN_MODE === 'development'
    ? process.env.NEXT_PUBLIC_API_URL_DEV
    : process.env.NEXT_PUBLIC_API_URL_PROD;

// Guard local development from accidental HTTPS localhost misconfiguration.
export const baseURL =
  rawBaseURL?.replace('https://localhost:3333', 'http://localhost:3333') ||
  'http://localhost:3333/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: false,
});

api.defaults.withCredentials = false;
const isBrowser = typeof window !== 'undefined';

api.interceptors.request.use(function (config) {
  if (config.headers) {
    let token: string | undefined;

    if (!isBrowser) {
      if (!context)
        throw 'Api Context not found. You must call `setApiContext(context)` before calling api on server-side';

      const cookies = new Cookies(context.req?.headers.cookie);
      token = cookies.get('jmmi-its');
    } else {
      token = getToken();
    }

    config.headers.Authorization = token ? `Bearer ${token}` : '';
  }

  return config;
});

api.interceptors.response.use(
  (config) => {
    return config;
  },
  (error: AxiosError<UninterceptedApiError>) => {
    // If token is invalid/expired, clear stored tokens and redirect to login
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    const messageStr = typeof serverMessage === 'string' ? serverMessage : '';
    if (
      typeof window !== 'undefined' &&
      (status === 401 || /expired|invalid/i.test(messageStr))
    ) {
      try {
        removeToken();
        removeRefreshToken();
      } catch (e) {
        // ignore
      }
      window.location.href = '/login';
      return Promise.reject(error);
    }
    // parse error
    if (error.response?.data.message) {
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            ...error.response.data,
            message:
              typeof error.response.data.message === 'string'
                ? error.response.data.message
                : (
                    Object.values(error.response.data.message) as string[][]
                  )[0][0],
          },
        },
      });
    }
    return Promise.reject(error);
  }
);
export default api;
