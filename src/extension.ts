import { ExtensionContext, commands, window, workspace } from 'vscode';
import { copyResourcePath, createDatapack, createFile, scoreOperation } from './commands';
import { loadLocale } from './locales';

export const codeConsole = window.createOutputChannel('MC Commander Util');
export let config = workspace.getConfiguration('mcdutil');
const vscodeLanguage = getVSCodeLanguage();
/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: ExtensionContext): void {

    loadLocale(config.get<string>('language', 'default'), vscodeLanguage);

    const disposable = [];

    disposable.push(commands.registerCommand('mcdutil.commands.createDatapackTemplate', createDatapack));
    disposable.push(commands.registerCommand('mcdutil.commands.createFile', createFile));
    disposable.push(commands.registerCommand('mcdutil.commands.scoreOperation', scoreOperation));
    disposable.push(commands.registerCommand('mcdutil.commands.copyResourcePath', copyResourcePath));

    disposable.push(workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('mcdutil')) {
            config = workspace.getConfiguration('mcdutil');
            loadLocale(config.get<string>('language', 'default'), vscodeLanguage);
        }
    }));

    context.subscriptions.push(...disposable);
}

/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019-2020 SPGoding
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
function getVSCodeLanguage(): string {
    if (process.env.VSCODE_NLS_CONFIG) {
        try {
            const codeConfig = JSON.parse(process.env.VSCODE_NLS_CONFIG);
            if (typeof codeConfig.locale === 'string') {
                const code: string = codeConfig.locale;
                return code === 'en-us' ? 'en' : code;
            } else {
                codeConsole.appendLine(`Have issues parsing VSCODE_NLS_CONFIG: “${process.env.VSCODE_NLS_CONFIG}”`);
            }
        } catch (ignored) {
            codeConsole.appendLine(`Have issues parsing VSCODE_NLS_CONFIG: “${process.env.VSCODE_NLS_CONFIG}”`);
        }
    } else {
        codeConsole.appendLine('No VSCODE_NLS_CONFIG found.');
    }
    return 'en';
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void { }