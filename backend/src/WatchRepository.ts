const watch = require('node-watch')

export async function watchRepository(path: string, handler: () => void): Promise<void> {
    const ignoredPaths = [
        '.git',
        'node_modules',
        'vendor',
        '.idea',
        'var',
    ]

    watch(path, {
        recursive: true,
        filter(file: string, skip: symbol): boolean | symbol {
            const isIgnored = file.split('/')
                .some((path: string): boolean => ignoredPaths.includes(path))

            return !isIgnored ? true : skip;
        }
    }, function (evt, name) {
        console.log('%s changed.', name)
        handler()
    });
}
