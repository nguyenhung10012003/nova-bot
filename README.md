# Turbo NestJs NextJs Shadcn Template

This is a Turborepo template project stater using NestJs, NextJs and Shadcn Library UI

## Using this example

### Clone this repo

```bash
git clone https://github.com/nguyenhung10012003/turbo-nest-next-shadcn-template.git
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

    .
    ├── apps
    │   ├── api                       # NestJS app (https://nestjs.com).
    │   └── web                       # Next.js app (https://nextjs.org).
    └── packages
        ├── @repo/eslint-config       # `eslint` configurations (includes `prettier`)
        ├── @repo/jest-config         # `jest` configurations
        ├── @repo/typescript-config   # `tsconfig.json`s used throughout the monorepo
        └── @repo/ui                  # Shareable stub React component library, using shadcn/ui (https://ui.shadcn.com/).

### Utilities

This repo using `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Jest](https://prettier.io) & [Playwright](https://playwright.dev/) for testing

#### Install all dependencies

```bash
yarn install
```

#### Build

```bash
# Will build all the app & packages with the supported `build` script.
yarn build

# ℹ️ If you plan to only build apps individually,
# Please make sure you've built the packages first.
```

##### Or build target packages & apps

```bash
yarn build --filter [target1] --filter [target2]
```

#### Develop

```bash
# Will run the development server for all the app & packages with the supported `dev` script.
yarn run dev
```

#### Add shadcn-ui components

```bash
yarn shadcn:add [components]
```

#### Test

```bash
# Will launch a test suites for all the app & packages with the supported `test` script.
yarn run test

# You can launch e2e testes with `test:e2e`
yarn run test:e2e

# See `@repo/jest-config` to customize the behavior.
```

#### Lint

```bash
# Will lint all the app & packages with the supported `lint` script.
# See `@repo/eslint-config` to customize the behavior.
yarn run lint
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
