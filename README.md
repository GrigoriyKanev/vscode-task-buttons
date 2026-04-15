# Task Buttons VSCode Extension

A VSCode extension that adds configurable task buttons to the status bar for quick execution of user-defined tasks stored in VS Code settings.

## Features

- **User-specific configuration**: Each user can keep their own set of task buttons and commands in VS Code settings
- **Configurable buttons**: Customize button names, icons, and tooltips
- **Live configuration updates**: Changes to user settings are automatically applied
- **Task integration**: Executes inline tasks directly from your User Settings

## Setup

1. Install the extension
2. Open your VS Code user settings JSON
3. Configure your task buttons and task commands (see configuration below)
4. The buttons will automatically appear in the status bar

## Configuration

Add the following settings to your user settings JSON:

```json
{
  "taskButtons.tasks": [
    {
      "name": "build",
      "command": "npm run build"
    },
    {
      "name": "test",
      "command": "npm test"
    },
    {
      "name": "dev",
      "command": "npm run dev"
    },
    {
      "name": "git-clean-gone-branches",
      "command": "powershell.exe",
      "args": [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass"
      ],
      "script": "if ((git branch --show-current) -ne 'master') { git switch master }; git fetch --prune; $branches = git for-each-ref --format='%(refname:short)%09%(upstream:track)' refs/heads | ForEach-Object { $parts = $_ -split \"`t\", 2; if ($parts.Count -lt 2) { return }; [pscustomobject]@{ Branch = $parts[0].Trim(); Track = $parts[1].Trim() } } | Where-Object { $_.Track -eq '[gone]' -and $_.Branch -ne 'master' }; foreach ($branch in $branches) { git branch -d $branch.Branch }"
    }
  ],
  "taskButtons.buttons": [
    {
      "name": "Build",
      "task": "build",
      "icon": "🔨",
      "tooltip": "Build the project"
    },
    {
      "name": "Test",
      "task": "test",
      "icon": "🧪",
      "tooltip": "Run tests"
    },
    {
      "name": "Start",
      "task": "dev",
      "icon": "▶️"
    }
  ]
}
```

### Configuration Options

- `name` (required): Display name for the button
- `task` (required): Name of the task defined in `taskButtons.tasks`
- `icon` (optional): Icon to display before the button name (emoji or text)
- `tooltip` (optional): Tooltip text when hovering over the button
- `command` (required in `taskButtons.tasks`): Executable to run, for example `powershell.exe`
- `args` (optional in `taskButtons.tasks`): Arguments passed to the executable
- `script` (optional in `taskButtons.tasks`): Inline command body passed to PowerShell with `-Command`

### Example User Settings
```json
{
  "taskButtons.tasks": [
    {
      "name": "build",
      "command": "npm run build"
    },
    {
      "name": "test",
      "command": "npm test"
    },
    {
      "name": "dev",
      "command": "npm run dev"
    },
    {
      "name": "git-clean-gone-branches",
      "command": "powershell.exe",
      "args": [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass"
      ],
      "script": "if ((git branch --show-current) -ne 'master') { git switch master }; git fetch --prune; $branches = git for-each-ref --format='%(refname:short)%09%(upstream:track)' refs/heads | ForEach-Object { $parts = $_ -split \"`t\", 2; if ($parts.Count -lt 2) { return }; [pscustomobject]@{ Branch = $parts[0].Trim(); Track = $parts[1].Trim() } } | Where-Object { $_.Track -eq '[gone]' -and $_.Branch -ne 'master' }; foreach ($branch in $branches) { git branch -d $branch.Branch }"
    }
  ],
  "taskButtons.buttons": [
    {
      "name": "Build",
      "task": "build",
      "icon": "🔨",
      "tooltip": "Build the project"
    },
    {
      "name": "Test",
      "task": "test",
      "icon": "🧪",
      "tooltip": "Run all tests"
    },
    {
      "name": "Dev Server",
      "task": "dev",
      "icon": "🚀",
      "tooltip": "Start development server"
    }
  ]
}
```

## Commands

The extension provides the following commands:

- `Task Buttons: Refresh` - Manually refresh the task buttons (useful if configuration changes aren't detected)

## How It Works

1. The extension loads on VSCode startup
2. It reads `taskButtons.tasks` and `taskButtons.buttons` from your user settings
3. For each button configuration, it creates a status bar item
4. When clicked, the button executes the matching inline task command
5. The extension watches for changes to those settings and updates buttons automatically

## Development

To set up the extension for development:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open in VSCode and press F5 to launch a new Extension Development Host
4. Test the extension in the development environment

## Requirements

- VSCode version 1.74.0 or higher
- User settings with `taskButtons.tasks` and `taskButtons.buttons`

## Publishing

You can publish this extension if you own the `publisher` value in `package.json` and have access to the Visual Studio Marketplace account for that publisher.

Before publishing, make sure:

1. The extension compiles cleanly with `npm run compile`.
2. The README example matches the current user-settings model.
3. You are ready to publish under `Condor304`, or you change the `publisher` field to your own marketplace publisher id.
4. You package and publish with the VSCE CLI or the modern `@vscode/vsce` workflow.

If you do not control the `Condor304` publisher account, you cannot publish under that id.

## License

MIT