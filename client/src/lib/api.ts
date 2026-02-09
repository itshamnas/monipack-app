import { queryClient } from "./queryClient";

export async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return res;
}

export function invalidateQueries(keys: string[]) {
  keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}
