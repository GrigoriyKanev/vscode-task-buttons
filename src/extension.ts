import * as vscode from 'vscode';

interface TaskButtonConfig {
    name: string;
    task: string;
    icon?: string;
    tooltip?: string;
}

interface TaskButtonsConfig {
    buttons: TaskButtonConfig[];
}

class TaskButtonManager {
    private statusBarItems: vscode.StatusBarItem[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async initialize() {
        await this.loadAndCreateButtons();
        this.setupConfigWatcher();
    }

    private async loadAndCreateButtons() {
        this.clearExistingButtons();

        const config = await this.loadConfig();
        if (!config) {
            return;
        }

        for (const buttonConfig of config.buttons) {
            this.createStatusBarButton(buttonConfig);
        }
    }

    private async loadConfig(): Promise<TaskButtonsConfig | null> {
        const config = vscode.workspace.getConfiguration('taskButtons');
        const inspectedConfig = config.inspect<TaskButtonConfig[]>('buttons');
        const buttons = inspectedConfig?.globalValue;

        if (!buttons || buttons.length === 0) {
            return null;
        }

        return {
            buttons
        };
    }

    private createStatusBarButton(config: TaskButtonConfig) {
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

        statusBarItem.text = config.icon ? `${config.icon} ${config.name}` : config.name;
        statusBarItem.tooltip = config.tooltip || `Execute task: ${config.task}`;
        statusBarItem.command = {
            command: 'taskButtons.executeTask',
            arguments: [config.task],
            title: 'Execute Task'
        };

        statusBarItem.show();
        this.statusBarItems.push(statusBarItem);
    }

    private async executeTask(taskName: string) {
        try {
            const tasks = await vscode.tasks.fetchTasks();
            const task = tasks.find(t => t.name === taskName);

            if (!task) {
                vscode.window.showErrorMessage(`Task "${taskName}" not found in tasks.json`);
                return;
            }

            await vscode.tasks.executeTask(task);
            vscode.window.showInformationMessage(`Executing task: ${taskName}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute task "${taskName}": ${error}`);
        }
    }

    private setupConfigWatcher() {
        this.context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration('taskButtons.buttons')) {
                    this.loadAndCreateButtons();
                }
            })
        );
    }

    private clearExistingButtons() {
        this.statusBarItems.forEach(item => item.dispose());
        this.statusBarItems = [];
    }

    public dispose() {
        this.clearExistingButtons();
    }

    public getExecuteTaskCommand() {
        return vscode.commands.registerCommand('taskButtons.executeTask', (taskName: string) => {
            this.executeTask(taskName);
        });
    }

    public getRefreshCommand() {
        return vscode.commands.registerCommand('taskButtons.refresh', () => {
            this.loadAndCreateButtons();
            vscode.window.showInformationMessage('Task buttons refreshed');
        });
    }
}

let taskButtonManager: TaskButtonManager;

export function activate(context: vscode.ExtensionContext) {
    taskButtonManager = new TaskButtonManager(context);

    context.subscriptions.push(
        taskButtonManager.getExecuteTaskCommand(),
        taskButtonManager.getRefreshCommand()
    );

    taskButtonManager.initialize();
}

export function deactivate() {
    if (taskButtonManager) {
        taskButtonManager.dispose();
    }
}