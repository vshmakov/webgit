# Webgit

Web-based Git GUI for local repositories.

## What it does

- view repository status and files
- switch and create branches
- create, checkout, and delete tags
- create commits
- push and fetch changes
- merge and rebase branches
- stage and revert files
- browse commit history
- use a responsive interface for desktop and mobile screens

## Stack

- React + TypeScript
- MobX
- NestJS
- simple-git
- Prettier

## Install

```bash
npm install --prefix frontend
npm install --prefix backend
```

## Build and run

```bash
npm run build
npm run start:prod
```

Open: http://localhost:3000

The build runs Prettier checks for both frontend and backend before compiling.

## Formatting

Check formatting without changing files:

```bash
npm run format:check
```

Apply formatting:

```bash
npm --prefix frontend run format
npm --prefix backend run format
```

## Notes

- production serves the built frontend from the backend
- only one mode should run at a time
- this is for local Git workflow, not a public SaaS product

