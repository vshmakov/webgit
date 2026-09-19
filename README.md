# Webgit

Web-based Git GUI for local repositories.

## What it does

- view repo status
- switch branches
- create commits
- push/pull
- merge/rebase
- stage and revert files
- browse commit history

## Stack

- React + TypeScript
- MobX
- NestJS
- simple-git

## Run

```bash
npm install
npm run build
npm run start:prod
```

Open: http://localhost:3000

## Notes

- production serves the built frontend from the backend
- only one mode should run at a time
- this is for local Git workflow, not a public SaaS product

