import {Body, Controller, Get, Put} from '@nestjs/common';
import simpleGit, {BranchSummary, BranchSummaryBranch, FileStatusResult, SimpleGit, StatusResult} from 'simple-git';
import {Response} from "simple-git/typings/simple-git";
import {exec, ExecException} from 'child_process'

const git: SimpleGit = simpleGit({
    // baseDir: '/home/vadim/projects/bluecentury/vemasys-prod',
    baseDir: '/home/vadim/projects/my/webgit',
})

git.outputHandler(function (command, stdout, stderr) {
    stdout.pipe(process.stdout);
})

@Controller()
export class AppController {
    @Get('/branches')
    public branches(): Response<BranchSummary> {
        return git.branch()
    }

    @Put('/branch/checkout')
    public async checkoutBranch(@Body() branch: BranchSummaryBranch): Promise<void> {
        await git.checkout(branch.name)
    }

    @Put('/branch/merge-tracking')
    public async mergeTracking(): Promise<void> {
        const status = await git.status()

        if (null === status.tracking) {
            return
        }

        await git.merge([status.tracking])
    }

    @Put('/branch/push')
    public async push(): Promise<void> {
        await git.push()
    }

    @Put('/branch/merge-into-current')
    public async mergeBranchIntoCurrent(@Body() branch: BranchSummaryBranch): Promise<void> {
        await git.merge([branch.name])
    }

    @Get('/status')
    public async status(): Promise<StatusResult> {
        return git.status()
    }

    @Put('/file/checkout')
    public async checkoutFile(@Body() file: FileStatusResult): Promise<void> {
        await git.checkout(file.path)
    }

    @Put('/fetch')
    public async fetch(): Promise<void> {
        await git.fetch()
    }

    @Put('/commit')
    public async commit(@Body() {
        message,
        stage,
        command
    }: { message: string, stage: boolean, command: string }): Promise<void> {
        if (command) {
            await this.execCommand(command)
        }

        if (stage) {
            await git.add('.')
        }

        git.commit(message)
    }

    private async execCommand(command: string): Promise<void> {
        return new Promise<void>((resolve): void => {
            exec(command, (error: ExecException | null, stdout: string, stderr: string): void => {
                if (null !== error) {
                    throw error
                }

                console.log('stdout:', stdout)
                console.log('stderr:', stderr)
                resolve()
            })
        })
    }
}
