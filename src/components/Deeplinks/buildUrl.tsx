export function buildUrl(pathname: string, params: URLSearchParams): string {
  return `phantom://v1/${pathname}?${params.toString()}`;
}

export function buildUrlPhantom(pathname: string, params: URLSearchParams): string {
  return `phantom://v1/${pathname}?${params.toString()}`;
}
export function buildUrlSolflare(pathname: string, params: URLSearchParams): string {
  return `https://solflare.com/ul/v1/${pathname}?${params.toString()}`;
}