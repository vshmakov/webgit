import {Body, Controller, Get, Put} from '@nestjs/common';
import simpleGit, {BranchSummary, BranchSummaryBranch, FileStatusResult, SimpleGit, StatusResult} from 'simple-git';
import {Response} from "simple-git/typings/simple-git";

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
    public status(): Response<StatusResult> {
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
    public async commit(@Body() {message, stage}: { message: string, stage: boolean }): Promise<void> {
        if (stage) {
            await git.add('.')
        }

        await git.commit(message)
    }
}
