import * as fs from 'fs/promises';
import {SimpleGit} from "simple-git";
import {Stats} from "node:fs";

const watch = require('node-watch')

export async function watchRepository(directory: string, handler: () => void, git: SimpleGit): Promise<void> {
    const ignored = [
        '.git',
    ].map((path: string): string => getFilePath(directory, path))
    const excluded = await getExcludedSubdirectories(directory, ignored, git)
            watch(directory, {
        recursive: true,
        filter(file: string, skip: symbol): boolean | symbol {
            const isExcluded = excluded.includes(file)

            return !isExcluded ? true : skip;
        }
    }, function (evt, name) {
        console.log('%s changed.', name)
        handler()
    });
}

async function getExcludedSubdirectories(directory: string, ignored: string[], git: SimpleGit): Promise<string[]> {
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
    const excludedSubdirectories: string[][] = []

    for (const directory of watchedDirectories) {
        excludedSubdirectories.push(await getExcludedSubdirectories(directory, [], git))
    }

    return Array.prototype.concat.apply(ignored, excludedSubdirectories).concat(excluded)
}

function getFilePath(directory: string, file: string): string {
    return [directory, file].join('/');
}
