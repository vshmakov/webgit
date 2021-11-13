import {Body, Controller, Get, Put} from '@nestjs/common';
import simpleGit, {
    BranchSummary,
    BranchSummaryBranch,
    FileStatusResult,
    MergeResult,
    SimpleGit,
    StatusResult
} from 'simple-git';
import {Response} from "simple-git/typings/simple-git";

const git: SimpleGit = simpleGit({
    baseDir: '/home/vadim/projects/bluecentury/vemasys-prod'
})

setInterval(
    () => git.fetch(),
    5 * 60 * 1000
)

@Controller()
export class AppController {
    @Get('/branches')
    public branches(): Response<BranchSummary> {
        return git.branch()
    }

    @Put('/branch/checkout')
    public checkoutBranch(@Body() branch: BranchSummaryBranch): Response<string> {
        return git.checkout(branch.name)
    }

    @Get('/status')
    public status(): Response<StatusResult> {
        return git.status()
    }

    @Put('/file/checkout')
    public checkoutFile(@Body() file: FileStatusResult): Response<string> {
        return git.checkout(file.path)
    }

    @Put('/branch/merge-tracking')
    public async mergeTracking(): Promise<null | MergeResult> {
        const status = await git.status()

        if (null === status.tracking) {
            return null
        }

        return git.merge([status.tracking])
    }
}
