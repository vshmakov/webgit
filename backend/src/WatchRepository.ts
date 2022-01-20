import {readFile} from 'fs/promises';
import {SimpleGit} from "simple-git";

const watch = require('node-watch')

export async function watchRepository(path: string, git: SimpleGit): Promise<void> {
    const ignoredPaths = await getIgnored()

    watch(path, {
        recursive: true,
        filter(file: string, skip: symbol): boolean | symbol {
            const isIgnored = ignoredPaths.some(((path: string): boolean => file.startsWith(path)))

            if (isIgnored) {
                return skip
            }

            console.log(file)

            return true
        }
    }, function (evt, name) {
        console.log('%s changed.', name);
    });
}

async function getIgnored(): Promise<string[]> {
    return [
        '.git',
        'node_modules',
    ]
}
