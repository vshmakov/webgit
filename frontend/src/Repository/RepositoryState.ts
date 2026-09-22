import { BranchSummaryBranch, LogResult, StatusResult } from "simple-git"
import { BranchesState } from "../Branch/BranchesState"
import { InMemoryFlag } from "../Flag/InMemoryFlag"
import { LocalStorage } from "../LocalStorage/LocalStorage"
import { LocalStorageKey } from "../LocalStorage/LocalStorageKey"
import { Loader } from "../Http/Loader"
import { makeAutoObservable } from "mobx"
import { request } from "../Http/Request"
import { Method } from "../Http/Method"
import { FileStatusResult } from "simple-git/typings/response"
import { LocalStorageFlag } from "../Flag/LocalStorageFlag"
import { BlockableFlag } from "../Flag/BlockableFlag"
import { disable } from "../Flag/Disable"
import { EmptyCommitMessage } from "../Commit/EmptyCommitMessage"
import { enable } from "../Flag/Enable"
import { RequestRepository } from "./RequestRepository"
import { requestStatus } from "./RequestStatus"
import { requestVersion } from "./RequestVersion"
import { requestBranches } from "./RequestBranches"
import { getBranchNameParts } from "../Branch/getBranchNameParts"
import { RemoteState } from "./RemoteState"

import { TimeTrackerState } from "./TimeTracker/TimeTrackerState"
import { playSound } from "../Util/WithSound"
import { TagsState } from "../Tag/TagsState"
import { requestTags } from "./RequestTags"

export class RepositoryState {
  public commitHistory: LogResult | null = null
  public historyLoading = false
  public historyCanLoadMore = false
  private historyOffset = 0
  public commitMessageStorage: LocalStorage<string> = new LocalStorage<string>(
    LocalStorageKey.CommitMessage,
    "",
    this.path
  )
  public readonly precommitCommandStorage = new LocalStorage<string>(
    LocalStorageKey.PrecommitCommand,
    "",
    this.path
  )
  public readonly remoteState = new RemoteState(this.path)
  public readonly timeTrackerState = new TimeTrackerState(this.path)
  public readonly useBranchAsCommitMessagePrefix = LocalStorageFlag.createByKey(
    LocalStorageKey.UseBranchAsCommitMessagePrefix,
    false,
    this.path
  )
  public readonly useSectionCommitMessagePrefix = LocalStorageFlag.createByKey(
    LocalStorageKey.UseSectionCommitMessagePrefix,
    false,
    this.path
  )
  public readonly pushOnCommit = LocalStorageFlag.createByKey(
    LocalStorageKey.PushOnCommit,
    false,
    this.path
  )
  public readonly useCommitMessageAsBranchTitle = LocalStorageFlag.createByKey(
    LocalStorageKey.UseCommitMessageAsBranchTitle,
    false,
    this.path
  )
  public sectionCommitMessagePrefix: LocalStorage<string> =
    new LocalStorage<string>(
      LocalStorageKey.SectionCommitMessagePrefix,
      "",
      this.path
    )
  public readonly fetchLoader = new Loader<void>(
    LocalStorageKey.FetchCalledAt,
    this.path,
    this.requestFetch.bind(this)
  )
  public newBranchName: string = ""
  public readonly isBranchCreation = new InMemoryFlag(false)
  public readonly isDisabled = new InMemoryFlag(false)
  private readonly loadedIssueSummaries: string[] = []
  public readonly cleanAfterCommit = new BlockableFlag(
    LocalStorageFlag.createByKey(
      LocalStorageKey.CleanAfterCommit,
      false,
      this.path
    ),
    (): boolean => !this.stageAllFilesBeforeCommit.isChecked
  )
  public readonly openCommitSettings = new InMemoryFlag(false)
  public readonly showHistory = new InMemoryFlag(false)
  public readonly showTags = new InMemoryFlag(false)
  public tags: TagsState | null = null
  public newTagName: string = ""
  public readonly allowEmptyCommit = new BlockableFlag(
    new InMemoryFlag(false),
    (): boolean => 0 !== this.status.files.length
  )
  public readonly stageAllFilesBeforeCommit = new BlockableFlag(
    LocalStorageFlag.createByKey(
      LocalStorageKey.StageAllFilesBeforeCommit,
      true,
      this.path
    ),
    (): boolean => this.allowEmptyCommit.isChecked
  )

  private constructor(
    public readonly path: string,
    public status: StatusResult,
    public branches: BranchesState,
    private readonly request: RequestRepository,
    public readonly statusLoader: Loader<StatusResult>,
    private readonly requestBranches: () => Promise<BranchesState>,
    private version: string | null
  ) {
    this.setStatus(this.status)
    makeAutoObservable(this)
  }

  public static async create(path: string): Promise<RepositoryState> {
    const requestRepository = request.bind(null, path)
    const statusLoader = new Loader(
      LocalStorageKey.StatusCalledAt,
      path,
      requestStatus.bind(null, requestRepository)
    )
    const requestRepositoryBranches = requestBranches.bind(
      null,
      requestRepository,
      path
    )
    const branches = requestRepositoryBranches()
    const version = requestVersion(requestRepository)

    return new RepositoryState(
      path,
      await statusLoader.load(),
      await branches,
      requestRepository,
      statusLoader,
      requestRepositoryBranches,
      await version
    )
  }

  public async loadCommitHistory(): Promise<void> {
    if (null !== this.commitHistory || this.historyLoading) {
      return
    }

    this.historyOffset = 0
    await this.loadCommitHistoryPage()
  }

  public async loadTags(): Promise<void> {
    const tags = await requestTags(this.request)

    if (null === this.tags) {
      this.tags = new TagsState(tags)
    } else {
      this.tags.setTags(tags)
    }
  }

  public async createTag(): Promise<void> {
    await this.request(Method.Post, "/tag/create", { name: this.newTagName })
    this.newTagName = ""
    await this.loadTags()
  }

  public async deleteTag(name: string): Promise<void> {
    await this.request(Method.Delete, "/tag", { name: name })
    await this.loadTags()
  }

  public async loadMoreCommitHistory(): Promise<void> {
    if (!this.historyCanLoadMore || this.historyLoading) {
      return
    }

    await this.loadCommitHistoryPage()
  }

  private async loadCommitHistoryPage(): Promise<void> {
    this.historyLoading = true

    try {
      const query = new URLSearchParams({
        limit: "15",
        skip: `${this.historyOffset}`
      }).toString()
      const response = await this.request(
        Method.Get,
        `/commit/history?${query}`
      )
      const page = (await response.json()) as LogResult
      const commits = this.commitHistory?.all || []

      this.setCommitHistory({
        ...page,
        all: commits.concat(page.all)
      })
      this.historyOffset += page.all.length
      this.historyCanLoadMore = 15 === page.all.length
    } finally {
      this.historyLoading = false
    }
  }

  private setCommitHistory(commitHistory: LogResult): void {
    this.commitHistory = commitHistory
  }

  public getBranchName(branch: BranchSummaryBranch): string {
    const name = branch.name

    if (this.useCommitMessageAsBranchTitle.isChecked) {
      const commitMessage = new LocalStorage(
        LocalStorageKey.CommitMessage,
        "",
        JSON.stringify([this.path, name])
      ).getValue()

      if (commitMessage) {
        return commitMessage
      }
    }

    const parts = getBranchNameParts(name)
    const provider = this.timeTrackerState.configuredProvider

    if (null === parts.issueId || null === provider) {
      return name
    }

    const summaries = provider.summariesStorage.getValue()
    const summary = summaries[parts.issueId]

    if (summary) {
      return `${branch.name}: ${summary}`
    }

    if (undefined === summary) {
      this.loadIssueSummary(parts.issueId)
    }

    return name
  }

  private async loadIssueSummary(issueId: string): Promise<void> {
    const provider = this.timeTrackerState.configuredProvider

    if (this.loadedIssueSummaries.includes(issueId) || null === provider) {
      return
    }

    const params = provider.getParameters() || {}
    params["key"] = issueId

    this.addLoadedIssueSummary(issueId)
    const search = new URLSearchParams(params).toString()
    const response = await this.request(Method.Get, `${provider.url}?${search}`)
    const summary = await response.json()
    const summaries = provider.summariesStorage.getValue()
    summaries[issueId] = summary
    provider.summariesStorage.setValue(summaries)
  }

  private addLoadedIssueSummary(key: string): void {
    this.loadedIssueSummaries.push(key)
  }

  public async checkChangedStatus(): Promise<void> {
    const version = await requestVersion(this.request)

    if (null === version || version === this.version) {
      return
    }

    this.version = version
    this.invalidateCommitHistory()
    await this.loadStatus()
    this.setBranchs(await this.requestBranches())
  }

  public async loadStatus(): Promise<void> {
    const status = this.statusLoader.load()
    this.setStatus(await status)
  }

  private invalidateCommitHistory(): void {
    this.commitHistory = null
    this.historyOffset = 0
    this.historyCanLoadMore = false
    disable(this.showHistory)
  }

  private setStatus(status: StatusResult): void {
    this.status = status
    const current = status.current
    this.sectionCommitMessagePrefix = new LocalStorage(
      LocalStorageKey.SectionCommitMessagePrefix,
      "",
      JSON.stringify([this.path, current])
    )
    this.commitMessageStorage = new LocalStorage(
      LocalStorageKey.CommitMessage,
      "",
      JSON.stringify([this.path, current])
    )

    if (null === current) {
      return
    }

    const isLoadedBranch = this.branches.branches.some(
      (branch: BranchSummaryBranch): boolean => current === branch.name
    )

    if (
      !isLoadedBranch &&
      !this.branches.historyStorage.getValue().includes(current)
    ) {
      this.loadBranches()
    }

    this.branches.addHistory(current)
  }

  private async loadBranches(): Promise<void> {
    const status = this.loadStatus()
    this.setBranchs(await this.requestBranches())
    await status
  }

  private setBranchs(branchesState: BranchesState): void {
    this.branches = branchesState
  }

  public async commit(): Promise<void> {
    await this.request(Method.Post, "/commit", {
      message: this.getCommitMessage(),
      stage: this.stageAllFilesBeforeCommit.isChecked,
      cleanAfterCommit: this.cleanAfterCommit.isChecked,
      allowEmpty: this.allowEmptyCommit.isChecked,
      command: this.precommitCommandStorage.getValue()
    })

    await this.loadStatus()

    if (this.pushOnCommit.isChecked) {
      await playSound()
      await this.push()
    }

    disable(this.allowEmptyCommit)
    disable(this.openCommitSettings)
  }

  private getCommitMessage(): string {
    if (this.allowEmptyCommit.isChecked) {
      return `${this.status.current} ${EmptyCommitMessage}`
    }

    let message = this.commitMessageStorage.getValue()

    if (this.useSectionCommitMessagePrefix.isChecked) {
      message = `[${this.sectionCommitMessagePrefix.getValue()}] ${message}`
    }

    const issueId = getBranchNameParts("" + this.status?.current).issueId

    if (this.useBranchAsCommitMessagePrefix.isChecked && null !== issueId) {
      message = `${issueId}: ${message}`
    }

    return message
  }

  public async checkout(reference: string): Promise<void> {
    enable(this.isDisabled)
    await this.request(Method.Put, "/checkout", {
      reference: reference
    })
    await this.loadStatus()
    disable(this.isDisabled)
    const current = this.status.current

    if (null !== current) {
      this.branches?.addHistory(current)
    }
  }

  public async rebaseCurrentToBranch(
    branch: BranchSummaryBranch
  ): Promise<void> {
    await this.request(Method.Put, "/branch/rebase-current-to-branch", branch)
    await this.loadStatus()
  }

  public async mergeBranchIntoCurrent(
    branch: BranchSummaryBranch
  ): Promise<void> {
    await this.request(Method.Put, "/branch/merge-into-current", branch)
    await this.loadStatus()
  }

  public async declineFile(file: FileStatusResult): Promise<void> {
    await this.request(Method.Put, "/file/decline", file)
    await this.loadStatus()
  }

  public async stage(path: string): Promise<void> {
    await this.request(Method.Put, "/file/stage", {
      filePath: path
    })
    await this.loadStatus()
  }

  public async rebaseTrackingBranch(): Promise<void> {
    await this.request(Method.Put, "/branch/rebase-tracking")
    await this.loadStatus()
  }

  public async mergeTrackingBranch(): Promise<void> {
    await this.request(Method.Put, "/branch/merge-tracking")
    await this.loadStatus()
  }

  public async push(): Promise<void> {
    await this.request(Method.Put, "/branch/push")
    await this.loadStatus()
  }

  public async createBranch(): Promise<void> {
    await this.request(Method.Post, "/branch/create", {
      name: this.newBranchName
    })
    await this.loadBranches()
    this.branches?.addHistory(this.newBranchName)
    this.cleanBranchCreation()
  }

  public async deleteBranch(name: string): Promise<void> {
    await this.request(Method.Delete, "/branch", { name: name })
    await this.loadBranches()
  }

  private cleanBranchCreation() {
    this.newBranchName = ""
    disable(this.isBranchCreation)
  }

  public async fetch(): Promise<void> {
    await this.fetchLoader.load()
    await this.loadStatus()
  }

  private async requestFetch(): Promise<void> {
    await this.request(Method.Put, "/fetch")
  }
}
