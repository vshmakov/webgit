import {Body, Controller, Get, Put} from '@nestjs/common';
import simpleGit, {BranchSummary, BranchSummaryBranch, SimpleGit, StatusResult} from 'simple-git';
import {Response} from "simple-git/typings/simple-git";

const git: SimpleGit = simpleGit({
    baseDir: '/home/vadim/projects/bluecentury/vemasys-prod'
})

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
}
