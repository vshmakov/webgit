export function getBranchNameParts(branch: string): { issueId: string | null, suffix: string } {
    const parts = branch.split('-')
    const prefix = parts.shift()
    const number = parts.shift()
    const issueId = prefix && number && /^\d+$/.test(number)
        ? [prefix, number].join('-')
        : null

    return {
        issueId: issueId,
        suffix: parts.join('-'),
    }
}
