/**
 * TanStack Query configuration and setup
 */

import { QueryClient } from "@tanstack/react-query";

export interface QueryKeys {
  hymns(): ["hymns"];
  hymn(id: number): ["hymn", number];
  search(q: string): ["search", string];
}

export const queryKeys: QueryKeys = {
  hymns: () => ["hymns"],
  hymn: (id: number) => ["hymn", id],
  search: (q: string) => ["search", q],
};

export interface CacheConfig {
  readonly staleTime: number; // 5 minutes
  readonly cacheTime: number; // 10 minutes
  readonly refetchOnWindowFocus: false;
}

export const cacheConfig: CacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: cacheConfig.staleTime,
      gcTime: cacheConfig.cacheTime,
      refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
    },
  },
});
