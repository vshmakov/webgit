# Webgit

Web-based Git GUI client for local repositories. The project combines a React frontend and a NestJS backend to manage a repository through the browser: view status, switch branches, create commits, push/pull, merge/rebase, and work with files without using the command line.

## Features

- view repository status and file list
- switch between branches
- create new branches
- view commit history
- commit with support for pre-commit commands and empty commits
- stage/unstage and revert file changes
- push, pull, merge, and rebase
- work with upstream tracking branches
- store local settings in LocalStorage

## Architecture

- frontend: React + TypeScript + MobX
- backend: NestJS + simple-git
- the backend API works with a local Git repository and provides data to the UI
- after the frontend is built, its static files can be served by the backend

## Requirements

- Node.js 16+
- npm
- Git

## Quick start

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Start the frontend

```bash
cd frontend
npm start
```

The frontend starts at http://localhost:3000 and proxies API requests to the backend.

### 3. Start the backend

```bash
cd backend
npm run start:dev
```

The backend runs at http://localhost:5000.

## Production build

```bash
cd frontend
npm run build
```

After building the frontend, the application can be opened through the backend server, since NestJS is configured to serve static files from `frontend/build`.

## Typical workflow

1. Open the application in the browser.
2. Select a local Git repository.
3. Check the status of files and branches.
4. Create/switch branches, make commits, and push changes.
5. Use merge/rebase and review commit history.

## Note

This project is more suitable for a local Git workflow than for a public SaaS service; its logic is designed around repositories stored on the disk of the machine where the app is running.

