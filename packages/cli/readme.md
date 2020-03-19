# Coffeegenerator CLI (coffeegen)
This tool allows you to easily host your own component library on GitLab and use it in your projects. It enables you to host a collection of standard components (i.e. a maps or login component that you often reuse) on GitLab repositories. These repositories reside in a repository group. With this tool, you can download these standard components and use them in your project.

### But NPM exists right?
Yes, this is to be used in conjunction with an NPM registry. This tool should be used when you want to incorporate a component in your project, but also want to change that component to the projects needs. You can also use this for other project related files like readme templates, configuration files and much more. All the stuff that you want to reuse but don't want to be placed in the 'node_modules' folder.

## Available commands

To use this application, use NPM to install it globally on your system:

`npm install @coffeeit/cli -g`

You can either use `coffeegen` or `coffeeit` to invoke the tool on the command line:

```bash
coffeeit <command>

Commands:
  coffeeit config                           Reconfigures the application
  coffeeit generate <platform>              Generates one or more components
  <components...>                                              [aliases: gen, g]
  coffeeit list [platform]                  Lists available platforms &
                                            components              [aliases: l]
  coffeeit logout                           Removes all saved GitLab tokens

Options:
  --help, -h  Show help                                                [boolean]
  --version   Show version number                                      [boolean]
```

```bash
coffeegen <command>

Commands:
  coffeegen config                          Reconfigures the application
  coffeegen generate <platform>             Generates one or more components
  <components...>                                              [aliases: gen, g]
  coffeegen list [platform]                 Lists available platforms &
                                            components              [aliases: l]
  coffeegen logout                          Removes all saved GitLab tokens

Options:
  --help, -h  Show help                                                [boolean]
  --version   Show version number                                      [boolean]
```

| Command  | Description                                                                                                 |   |   |   |
|----------|-------------------------------------------------------------------------------------------------------------|---|---|---|
| `coffeegen list`     | Shows an overview of available components and platforms                                                     |   |   |   |
| generate | Downloads a component from the specified platform repository and adds them to the current working directory |   |   |   |
| config   | Reconfigures the application (resets repository group and branch)                                           |   |   |   |
| logout   | Removes saved tokens from the token storage. You will need to login again                                   |   |   |   |

