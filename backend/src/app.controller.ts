import {Body, Controller, Get, Headers, Post, Put, Query} from '@nestjs/common';
import simpleGit, {
    BranchSummary,
    BranchSummaryBranch,
    CleanOptions,
    FileStatusResult,
    LogResult,
    SimpleGit,
    StatusResult
} from 'simple-git';
import {Response, Response as GitResponse} from "simple-git/typings/simple-git";
import {exec, ExecException} from 'child_process'
import fetch from "node-fetch";
import {isFileStaged} from "../../frontend/src/Shared/IsFileStaged";
import {IssueQuery} from "./IssueQuery";
import {PathHeaders} from "./PathHeaders";
import {watchRepository} from "./WatchRepository";

const clients: { [key: string]: SimpleGit } = {}
const watchIndexes: { [key: string]: number } = {}

function getPath(headers: PathHeaders) {
    return decodeURIComponent(headers.path);
}

function git(headers: PathHeaders): SimpleGit {
    const path = getPath(headers)

    if (undefined === clients[path]) {
        const client = simpleGit({
            baseDir: path
        });
        /*client.outputHandler(function (command, stdout, stderr): void {
    stdout.pipe(process.stdout);
})*/
        clients[path] = client

        watchIndexes[path] = 0
        watchRepository(path, (): void => {
            watchIndexes[path]++
            // console.log(watchIndexes[path])
        }, client)
    }

    return clients[path]
}

@Controller()
export class AppController {
    @Get('/repository/watch-index')
    public watchIndex(@Headers() headers: PathHeaders): number {
        return watchIndexes[getPath(headers)] || 0
    }

    @Get('/jira/issue-summary')
    public async jiraIssueSummary(@Query() query: IssueQuery): Promise<string> {
        const response = await fetch(`${query.path}/rest/api/latest/issue/${query.key}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${query.user}:${query.token}`).toString('base64'),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()

        return JSON.stringify(data?.fields?.summary || null)
    }

    @Get('/youtrack/issue-summary')
    public async youtrackIssueSummary(@Query() query: IssueQuery): Promise<string> {
        const response = await fetch(`${query.path}/api/issues/${query.key}?fields=summary`, {
            headers: {
                'Authorization': `Bearer ${query.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()

        return JSON.stringify(data?.summary || null)
    }

    @Get('/branches')
    public branches(@Headers() headers: PathHeaders): GitResponse<BranchSummary> {
        return git(headers).branchLocal()
    }

    @Put('/checkout')
    public async checkout(@Headers() headers: PathHeaders, @Body() {reference}: { reference: string }): Promise<void> {
        await git(headers).checkout(reference)
    }

    @Put('/branch/rebase-tracking')
    public async rebaseTracking(@Headers() headers: PathHeaders): Promise<void> {
        const client = git(headers)
        const status = await client.status()

        if (null === status.tracking
        ) {
            return
        }

        await client.rebase([status.tracking])
    }

    @Put('/branch/merge-tracking')
    public async mergeTracking(@Headers() headers: PathHeaders): Promise<void> {
        const client = git(headers)
        const status = await client.status()

        if (null === status.tracking
        ) {
            return
        }

        await client.merge([status.tracking])
    }

    @Put('/branch/push')
    public async push(@Headers() headers: PathHeaders): Promise<void> {
        const client = git(headers)
        const status = await client.status()
        await client.push(['-u', 'origin', status.current])
    }

    @Put('/branch/rebase-current-to-branch')
    public async rebaseCurrentToBranch(@Headers() headers: PathHeaders, @Body() branch: BranchSummaryBranch): Promise<void> {
        await git(headers).rebase([branch.name])
    }

    @Put('/branch/merge-into-current')
    public async mergeBranchIntoCurrent(@Headers() headers: PathHeaders, @Body() branch: BranchSummaryBranch): Promise<void> {
        await git(headers).merge([branch.name])
    }

    @Post('/branch/create')
    public async createBranch(@Headers() headers: PathHeaders, @Body() {name}: { name: string }): Promise<void> {
        await git(headers).checkoutLocalBranch(name)
    }

    @Get('/status')
    public async status(@Headers() headers: PathHeaders): Promise<StatusResult> {
        return git(headers).status()
    }

    @Put('/file/decline')
    public async declineFile(@Headers() headers: PathHeaders, @Body() file: FileStatusResult): Promise<void> {
        const client = git(headers)

        if ('?' === file.working_dir) {
            await client.clean(CleanOptions.FORCE, [file.path])

            return
        }

        await client.checkout(file.path)
    }

    @Put('/file/stage')
    public async stageFile(@Headers() headers: PathHeaders, @Body() {filePath}: { filePath: string }): Promise<void> {
        const client = git(headers)
        const status = await client.status()

        if (!isFileStaged(filePath, status)) {
            await client.add(filePath)
        } else {
            await client.raw(['restore', '--staged', filePath])
        }
    }

    @Put('/fetch')
    public async fetch(@Headers() headers: PathHeaders): Promise<void> {
        await git(headers).fetch()
    }

    @Post('/commit')
    public async commit(@Headers() headers: PathHeaders, @Body() {
                            message,
                            stage,
                            cleanAfterCommit,
                            allowEmpty,
                            command
                        }: {
                            message: string,
                            stage: boolean,
                            cleanAfterCommit: Boolean,
                            allowEmpty: boolean,
                            command: string
                        }
    ): Promise<void> {
        if (command) {
            if (!await this.execCommand(command)) {
                return
            }
        }

        const client = git(headers)

        if (stage) {
            await client.add('.')
        }

        const options = []
        const status = await client.status()

        if (allowEmpty && 0 === status.files.length) {
            options.push('--allow-empty')
        }

        await client.commit(message, options)

        if (stage && cleanAfterCommit) {
            await client.clean(CleanOptions.FORCE, ['-d'])
        }
    }

    @Get('/commit/history')
    public commitHistory(@Headers() headers: PathHeaders): Response<LogResult> {
        return git(headers).log(['-n', '20'])
    }

    private async execCommand(command: string): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {
            const childProcess = exec(command, (error: ExecException | null, stdout: string, stderr: string): void => {
                console.log('stdout:', stdout)
                console.log('stderr:', stderr)

                if (null !== error) {
                    console.log(error)
                    resolve(false)
                }
            })
            childProcess.on('exit', (code: number | null): void => {
                resolve(0 === code)
            })
        })
    }
}
