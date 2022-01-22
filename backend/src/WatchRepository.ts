import * as fs from 'fs/promises';
import {SimpleGit} from "simple-git";

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
    const files = (await fs.readdir(directory))
        .map((file: string): string => getFilePath(directory, file))
        .filter((file: string): boolean => !ignored.includes(file))
    const statuses = await waitAll(createObjectByKeys(files, fs.lstat))
    const directories = Object.keys(statuses)
        .filter((file: string): boolean => statuses[file].isDirectory())
    const excluded = 0 !== directories.length ? await git.checkIgnore(directories) : []
    const excludedSubdirectories: string[][] = await Promise.all(directories
        .filter((directory: string): boolean => !excluded.includes(directory))
        .map((directory: string): Promise<string[]> => getExcludedSubdirectories(directory, [], git)))

    return Array.prototype.concat.apply(ignored, excludedSubdirectories).concat(excluded)
}

async function waitAll<T>(object: { [key: string]: Promise<T> }): Promise<{ [key: string]: T }> {
    const waited = {}

    for (const key in object) {
        waited[key] = await object[key]
    }

    return waited
}

function createObjectByKeys<T>(keys: string[], callback: (key: string) => T): { [key: string]: T } {
    const object = {}

    for (const key of keys) {
        object[key] = callback(key)
    }

    return object
}

function getFilePath(directory: string, file: string): string {
    return [directory, file].join('/');
}
