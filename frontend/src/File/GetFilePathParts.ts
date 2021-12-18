export function getFilePathParts(path: string): { name: string, directory: string } {
    const parts = path.split('/')

    return {
        name: parts.pop() || '',
        directory: parts.join('/')
    }
}
