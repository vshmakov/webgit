import * as fs from 'fs/promises';
import {SimpleGit} from "simple-git";
import {Stats} from "node:fs";

const watch = require('node-watch')

export async function watchRepository(directory: string, handler: () => void, git: SimpleGit): Promise<void> {
    const ignored = [
        '.git',
    ].map((path: string): string => getFilePath(directory, path))
    console.log(await getWatchedSubdirectories(directory, git, ignored))

    return
    const ignoredPaths = [
        '.git',
        'node_modules',
        'vendor',
        '.idea',
        'var',
    ]

    watch(directory, {
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

function getFilePath(directory: string, file: string): string {
    return [directory, file].join('/');
}

async function getWatchedSubdirectories(directory: string, git: SimpleGit, ignored: string[]): Promise<string[]> {
    const files: { [key: string]: Promise<Stats> } = {}

    for (const fileName of await fs.readdir(directory)) {
        const file = getFilePath(directory, fileName)

        if (!ignored.includes(file)){
            files[file] = fs.lstat(file)
        }
    }

    const directories: string[] = []

    for (const file in files) {
        const status = await files[file]

        if (status.isDirectory()) {
            directories.push(file)
        }
    }

    const excluded = 0 !== directories.length ? await git.checkIgnore(directories) : []
    const watchedDirectories = directories.filter((directory: string): boolean => !excluded.includes(directory))
    const subdirectories: string[][] = []

    for (const directory of watchedDirectories) {
        subdirectories.push(await getWatchedSubdirectories(directory, git, ignored))
    }

    return Array.prototype.concat.apply(watchedDirectories, subdirectories)
}
