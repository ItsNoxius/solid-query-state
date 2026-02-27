export function renderQueryString(search: URLSearchParams): string {
    const str = search.toString();
    return str ? `?${str}` : "";
}
