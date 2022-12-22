# Contributing

- [Get Started](#get-started)
  - [Requirements](#requirements)
  - [Development Setup](#development-setup)
  - [Development Runs](#development-runs)
- [Deployment](#deployment)
- [Best practice](#best-practice)
  - [Conventional Commits](#conventional-commits)
- [IDEs](#ides)
  - [Recommended Visual Studio Code settings](#recommended-visual-studio-code-settings)

## Get Started

### Requirements

- [Node.js](https://nodejs.org)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Docker](https://www.docker.com/get-started)

### Development Setup

> ⚠️ **Important**  
> If you're under **Windows**, please run all the CLI commands within a Linux shell-like terminal (i.e.: Git Bash).

Then run:

```sh
git clone https://github.com/betagouv/inca-app.git
cd inca-app
yarn
yarn setup
yarn dev:docker
yarn db:migrate
yarn db:seed
yarn dev
```

This will run PostgreSQL within a Docker container via Docker Compose as well as then webapp which should then be
available at [http://localhost:3000](http://localhost:3000).

It will also watch for file changes and automatically re-hydrate the webapp on the go.

> 📋 **Note**  
> The `yarn` command install the dependencies but also run the `scripts/dev/setup.js` scripts. This script does the
> following tasks, if necessary:
>
> - Copy `.env.example` file to a `.env` one.
> - Generate a RSA Key Pair (required in order to generate and verify [JWTs](https://jwt.io))

### Development Runs

Once your local repository has been setup, you can subsequently run the development environment with:

```sh
yarn dev:docker
yarn dev
```

## Deployment

Following [our global deployment strategy](https://github.com/betagouv/inca-proxy#how-it-works):

```sh
ssh <USERNAME>@<SERVER_IP>
mkdir ~/deployments/inca-app
```

Add the current proxy Git repository workflow:

```sh
git init --bare ~/repositories/inca-app.git
vim ~/repositories/inca-app.git/hooks/post-receive
```

which could look like this:

```sh
#!/bin/bash

# Exit when any command fails:
set -e

TARGET="/home/<USERNAME>/deployments/inca-app"
GIT_DIR="/home/<USERNAME>/repositories/inca-app.git"
BRANCH="main"

while read oldrev newrev ref
do
  # Only checking out the specified branch:
  if [[ $ref = "refs/heads/${BRANCH}" ]]; then
    echo "Git reference $ref received. Deploying ${BRANCH} branch to production..."
    git --work-tree="$TARGET" --git-dir="$GIT_DIR" checkout -f "$BRANCH"
    cd $TARGET
    sudo make start
  else
    echo "Git reference $ref received. Doing nothing: only the ${BRANCH} branch may be deployed on this server."
  fi
done
```

Give the execution rights:

```sh
chmod +x ~/repositories/inca-app.git/hooks/post-receive
```

You can now exit and go into you your local proxy directory to add your server repository reference:

```sh
git remote add live ssh://<USERNAME>@<SERVER_IP>/home/<USERNAME>/repositories/inca-app.git
```

Everything is now ready for the proxy part and you will now be able to push any new commit to production via:

```sh
git push live main
```

## Best practice

### Conventional Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) principles.

Please try to check the existing history before committing anything if you're not familiar with this convention.

Thanks to [husky](https://github.com/typicode/husky), your code should be automatically linted before your changes are
committed. If there is any lint error left, your changes won't be committed. It's up to you to fix them.

## IDEs

### Recommended Visual Studio Code settings

`.vscode/settings.json`

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "eslint.codeActionsOnSave.mode": "all",
  "editor.defaultFormatter": "dbaeumer.vscode-eslint",
  "eslint.format.enable": true,
  "editor.formatOnSave": true,
  "eslint.packageManager": "yarn",
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```
