export function getIssueId(branch: string): string | null {
    const parts = branch.split('-')
    const prefix = parts.shift()
    const number = parts.shift()

    return prefix && number ? [prefix, number].join('-') : null
}
