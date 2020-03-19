# Coffee generator
This is the monorepo for the coffeegenerator tool. This repo contains the following packages:
- **Generator**: has logic for interacting and authenticating with the GitLab API and downloading and copying files.
- **CLI tool**: this tool can be run from the command line and allows a user to view a list of available components and download them to a certain folder
- **Visual Studio Code extension**: this tool runs as an extension in your VS Code editor. You can use this tool to see an overview of available components, search within them and add them to your project.

The main logic resides in the `generator` package. The `cli` and `vscode-extension` packages both use this package.

## What can i do with this?
This tool can be run from the command line or as a Visual Studio Code extension. It enables you to host a collection of standard components (i.e. a maps or login component that you often reuse) on GitLab repositories. These repositories reside in a repository group. With this tool, you can download these standard components and use them in your project.

### But NPM exists right?
Yes, this is to be used in conjunction with an NPM registry. This tool should be used when you want to incorporate a component in your project, but also want to change that component to the projects needs. You can also use this for other project related files like readme templates, configuration files and much more. All the stuff that you want to reuse but don't want to be placed in the 'node_modules' folder.

## Building
Run `npm run build` in the root of this repository for building the `generator` and `cli` packages. The vscode extension has its own build script and needs to be built separately.

This monorepo is managed by [Lerna](https://github.com/lerna/lerna). Lerna enables the generator and cli packages in this monorepo to use each other as a dependency.

## Packaging and publishing the extension
The vscode extension is packaged and published by `vsce`. This is a cli tool from Microsoft. Vsce does not support symlinked packages, which is why the extension is in a separate folder. You need to build and publish the `generator` package to an NPM registry first before you can package and publish the extension.