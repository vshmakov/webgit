export function getPathUrl(path: string): string {
    return `?path=${encodeURIComponent(path)}`;
}
