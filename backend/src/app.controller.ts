import {Body, Controller, Get, Post, Put} from '@nestjs/common';
import simpleGit, {
    BranchSummary,
    BranchSummaryBranch,
    CleanOptions,
    FileStatusResult,
    SimpleGit,
    StatusResult
} from 'simple-git';
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
        return git.branchLocal()
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
        const status = await git.status()
        await git.push(['-u', 'origin', status.current])
    }

    @Put('/branch/merge-into-current')
    public async mergeBranchIntoCurrent(@Body() branch: BranchSummaryBranch): Promise<void> {
        await git.merge([branch.name])
    }

    @Post('/branch/create')
    public async createBranch(@Body() {name}: { name: string }): Promise<void> {
        await git.checkoutLocalBranch(name)
    }

    @Get('/status')
    public async status(): Promise<StatusResult> {
        return git.status()
    }

    @Put('/file/decline')
    public async declineFile(@Body() file: FileStatusResult): Promise<void> {

        if ('?' === file.working_dir) {
            await git.clean(CleanOptions.FORCE, [file.path])

            return
        }

        await git.checkout(file.path)
    }

    @Put('/fetch')
    public async fetch(): Promise<void> {
        await git.fetch()
    }

    @Post('/commit')
    public async commit(@Body() {
        message,
        stage,
        command
    }: { message: string, stage: boolean, command: string }): Promise<void> {
        if (command) {
            if (!await this.execCommand(command)) {
                return
            }
        }

        if (stage) {
            await git.add('.')
        }

        git.commit(message)
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
