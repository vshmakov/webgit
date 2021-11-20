import {Body, Controller, Get, Headers, Post, Put, Query} from '@nestjs/common';
import simpleGit, {
    BranchSummary,
    BranchSummaryBranch,
    CleanOptions,
    FileStatusResult,
    SimpleGit,
    StatusResult
} from 'simple-git';
import {Response as GitResponse} from "simple-git/typings/simple-git";
import {exec, ExecException} from 'child_process'
import fetch from "node-fetch";


const clients: { [key: string]: SimpleGit } = {}

function git(path: string): SimpleGit {
    if (undefined === clients[path]) {
        const client = simpleGit({
            baseDir: path
        });
        client.outputHandler(function (command, stdout, stderr) {
            stdout.pipe(process.stdout);
        })
        clients[path] = client
    }

    return clients[path]
}

@Controller()
export class AppController {
    @Get('/jira/issue')
    public async issue(@Body() {host, key, user, token}: IssueBody): Promise<string> {
        const response = await fetch(`https://${host}/rest/api/latest/issue/${key}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64'),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()

        return data.fields.summary
    }

    @Get('/branches')
    public branches(@Headers() {path}: PathHeaders): GitResponse<BranchSummary> {
        return git(path).branchLocal()
    }

    @Put('/branch/checkout')
    public async checkoutBranch(@Headers() {path}: PathHeaders, @Body() branch: BranchSummaryBranch): Promise<void> {
        await git(path).checkout(branch.name)
    }

    @Put('/branch/merge-tracking')
    public async mergeTracking(@Headers() {path}: PathHeaders): Promise<void> {
        const client = git(path)
        const status = await client.status()

        if (null === status.tracking) {
            return
        }

        await client.merge([status.tracking])
    }

    @Put('/branch/push')
    public async push(@Headers() {path}: PathHeaders): Promise<void> {
        const client = git(path)
        const status = await client.status()
        await client.push(['-u', 'origin', status.current])
    }

    @Put('/branch/merge-into-current')
    public async mergeBranchIntoCurrent(@Headers() {path}: PathHeaders, @Body() branch: BranchSummaryBranch): Promise<void> {
        await git(path).merge([branch.name])
    }

    @Post('/branch/create')
    public async createBranch(@Headers() {path}: PathHeaders, @Body() {name}: { name: string }): Promise<void> {
        await git(path).checkoutLocalBranch(name)
    }

    @Get('/status')
    public async status(@Headers() {path}: PathHeaders): Promise<StatusResult> {
        return git(path).status()
    }

    @Put('/file/decline')
    public async declineFile(@Headers() {path}: PathHeaders, @Body() file: FileStatusResult): Promise<void> {
        const client = git(path)

        if ('?' === file.working_dir) {
            await client.clean(CleanOptions.FORCE, [file.path])

            return
        }

        await client.checkout(file.path)
    }

    @Put('/fetch')
    public async fetch(@Headers() {path}: PathHeaders): Promise<void> {
        await git(path).fetch()
    }

    @Post('/commit')
    public async commit(@Headers() {path}: PathHeaders, @Body() {
        message,
        stage,
        command
    }: { message: string, stage: boolean, command: string }): Promise<void> {
        if (command) {
            if (!await this.execCommand(command)) {
                return
            }
        }

        const client = git(path)

        if (stage) {
            await client.add('.')
        }

        await client.commit(message)
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

interface PathHeaders {
    path: string
}

interface IssueBody {
    host: string,
    key: string,
    user: string,
    token: string
}
