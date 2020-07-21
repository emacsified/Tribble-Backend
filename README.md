# Tribble - Backend

# Table of contents:

- [Pre-reqs](#pre-reqs)
- [Getting started](#getting-started)
- [Deploying the app](#deploying-the-app) - [Pre-reqs](#pre-reqs-1) - [Deploying to Azure App Service](#deploying-to-azure-app-service)
- [TypeScript + Node](#typescript--node) - [Getting TypeScript](#getting-typescript) - [Project Structure](#project-structure) - [Building the project](#building-the-project) - [Type Definition (`.d.ts`) Files](#type-definition-dts-files) - [Debugging](#debugging) - [Testing](#testing) - [ESLint](#eslint)
- [Dependencies](#dependencies) - [`dependencies`](#dependencies-1) - [`devDependencies`](#devdependencies)
- [Hackathon Starter Project](#hackathon-starter-project)

# Pre-reqs

To build and run this app locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/)
- Install [PostgreSQL](https://docs.mongodb.com/manual/installation)

# Getting started

- Clone the repository

```
git clone --depth=1 https://github.com/emacsified/Tribble-Backend.git <project_name>
```

- Install dependencies

```
cd <project_name>
npm install
```

- TODO: Configure your Postgres Server

```bash
# create the db directory
sudo mkdir -p /data/db
# give the db correct read/write permissions
sudo chmod 777 /data/db

# starting from macOS 10.15 even the admin cannot create directory at root
# so lets create the db directory under the home directory.
mkdir -p ~/data/db
# user account has automatically read and write permissions for ~/data/db.
```

- TODO: Start your Postgres Server

```bash
mongod

# on macOS 10.15 or above the db directory is under home directory
mongod --dbpath ~/data/db
```

- Build and run the project

```
npm run build
npm start
```

Finally, navigate to `http://localhost:3000` and you should see the template being served and rendered locally!

### Running the build

All the different build steps are orchestrated via [npm scripts](https://docs.npmjs.com/misc/scripts).
Npm scripts basically allow us to call (and chain) terminal commands via npm.
This is nice because most JavaScript tools have easy to use command line utilities allowing us to not need grunt or gulp to manage our builds.
If you open `package.json`, you will see a `scripts` section with all the different scripts you can call.
To call a script, simply run `npm run <script-name>` from the command line.
You'll notice that npm scripts can call each other which makes it easy to compose complex builds out of simple individual build scripts.
Below is a list of all the scripts this template has available:

| Npm Script           | Description                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `start`              | Does the same as 'npm run serve'. Can be invoked with `npm start`                             |
| `build`              | Full build. Runs ALL build tasks (`build-sass`, `build-ts`, `lint`, `copy-static-assets`)     |
| `serve`              | Runs node on `dist/server.js` which is the apps entry point                                   |
| `watch-node`         | Runs node with nodemon so the process restarts if it crashes. Used in the main watch task     |
| `watch`              | Runs all watch tasks (TypeScript, Sass, Node). Use this if you're not touching static assets. |
| `test`               | Runs tests using Jest test runner                                                             |
| `watch-test`         | Runs tests in watch mode                                                                      |
| `build-ts`           | Compiles all source `.ts` files to `.js` files in the `dist` folder                           |
| `watch-ts`           | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed           |
| `build-sass`         | Compiles all `.scss` files to `.css` files                                                    |
| `watch-sass`         | Same as `build-sass` but continuously watches `.scss` files and re-compiles when needed       |
| `lint`               | Runs ESLint on project files                                                                  |
| `copy-static-assets` | Calls script that copies JS libs, fonts, and images to dist directory                         |
| `debug`              | Performs a full build and then serves the app in watch mode                                   |
| `serve-debug`        | Runs the app with the --inspect flag                                                          |
| `watch-debug`        | The same as `watch` but includes the --inspect flag so you can attach a debugger              |

### Running tests

Simply run `npm run test`.
Note this will also generate a coverage report.

### Writing tests

Writing tests for web apps has entire books dedicated to it and best practices are strongly influenced by personal style, so I'm deliberately avoiding discussing how or when to write tests in this guide.
However, if prescriptive guidance on testing is something that you're interested in, [let me know](https://www.surveymonkey.com/r/LN2CV82), I'll do some homework and get back to you.

## ESLint

ESLint is a code linter which mainly helps catch quickly minor code quality and style issues.

### ESLint rules

Like most linters, ESLint has a wide set of configurable rules as well as support for custom rule sets.
All rules are configured through `.eslintrc` configuration file.
In this project, we are using a fairly basic set of rules with no additional custom rules.

### Running ESLint

Like the rest of our build steps, we use npm scripts to invoke ESLint.
To run ESLint you can call the main build script or just the ESLint task.

```
npm run build   // runs full build including ESLint
npm run lint    // runs only ESLint
```

Notice that ESLint is not a part of the main watch task.
