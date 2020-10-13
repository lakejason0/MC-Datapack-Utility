import { workspace, window, Uri, QuickPickItem } from 'vscode';
import * as common from '../utils/common';
import path from 'path';
import * as file from '../utils/file';
import { TextEncoder } from 'util';
import '../utils/methodExtensions';

export async function createDatapack(): Promise<void> {

    // フォルダ選択
    const dir = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: workspace.workspaceFolders?.[0].uri,
        filters: undefined,
        openLabel: 'Select',
        title: 'Select Datapack'
    }).then(v => v?.[0]);
    if (!dir) {
        return;
    }

    // Datapack内部かチェック
    const datapackRoot = await common.getDatapackRoot(dir.fsPath);

    if (datapackRoot) {
        // 内部なら確認
        const warningMessage = `The selected directory is inside Datapack ${path.basename(datapackRoot)}. Would you like to create a Datapack here?`;
        const result = await window.showWarningMessage(warningMessage, 'Yes', 'Reselect', 'No');
        if (result === 'No') {
            return;
        }
        if (result === 'Reselect') {
            createDatapack();
            return;
        }
    }

    // データパック名入力
    const datapackName = await window.showInputBox({
        value: '',
        placeHolder: '',
        prompt: 'datapack name?',
        ignoreFocusOut: true,
        validateInput: value => {
            if (value.match(/[\\/:*?"<>|]/)) {
                return '[\\/:*?"<>|] Cannot be used in the name';
            }
        }
    });
    if (!datapackName) {
        return;
    }

    // 名前空間入力
    const namespace = await window.showInputBox({
        value: '',
        placeHolder: '',
        prompt: 'namespace name?',
        ignoreFocusOut: true,
        validateInput: value => {
            if (!value.match(/^[a-z0-9./_-]*$/)) {
                return 'Characters other than [a-z0-9./_-] exist.';
            }
        }
    });
    if (!namespace) {
        return;
    }

    // 生成するファイル/フォルダを選択
    const createItems = await window.showQuickPick(getItems(namespace, dir, datapackName), {
        canPickMany: true,
        ignoreFocusOut: false,
        matchOnDescription: false,
        matchOnDetail: false,
        placeHolder: 'Select files/folders to generate'
    });
    if (!createItems) {
        return;
    }

    const enconder = new TextEncoder();
    createItems.flat(v => v.changes).forEach(async v => {
        if (v.type === 'file') {
            await file.create(v.fileUri, enconder.encode(v.content?.join('\r\n') ?? ''));
        }
        if (v.type === 'folder') {
            await file.createDir(v.fileUri);
        }
    });
}

interface QuickPickFiles extends QuickPickItem {
    changes: {
        type: 'file' | 'folder'
        fileUri: Uri
        content?: string[]
    }[]
}

function getItems(namespace: string, dir: Uri, datapackName: string): QuickPickFiles[] {
    dir = Uri.joinPath(dir, datapackName, 'data');
    return [
        // {// TODO
        //     label: `vanilla tags`,
        //     changes: []
        // },
        {
            label: `#load.json & ${namespace}:load.mcfunction`,
            picked: true,
            changes: [
                {
                    type: 'file',
                    fileUri: Uri.joinPath(dir, 'minecraft/tags/functions/load.json'),
                    content: [
                        '{',
                        '    "value": [',
                        `        "${namespace}:load"`,
                        '    ]',
                        '}'
                    ]
                },
                {
                    type: 'file',
                    fileUri: Uri.joinPath(dir, `${namespace}/functions/load.mcfunction`),
                    content: ['']
                }
            ]
        },
        {
            label: `#tick.json & ${namespace}:tick.mcfunction`,
            picked: true,
            changes: [
                {
                    type: 'file',
                    fileUri: Uri.joinPath(dir, 'minecraft/tags/functions/tick.json'),
                    content: [
                        '{',
                        '    "value": [',
                        `        "${namespace}:tick"`,
                        '    ]',
                        '}'
                    ]
                },
                {
                    type: 'file',
                    fileUri: Uri.joinPath(dir, `${namespace}/functions/tick.mcfunction`),
                    content: ['']
                }
            ]
        },
        {
            label: `data/${namespace}/advancements/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/advancements/`)
                }
            ]
        },
        {
            label: `data/${namespace}/dimensions/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/dimensions/`)
                }
            ]
        },
        {
            label: `data/${namespace}/dimension_types/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/dimension_types/`)
                }
            ]
        },
        {
            label: `data/${namespace}/loot_tables/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/loot_tables/`)
                }
            ]
        },
        {
            label: `data/${namespace}/predicates/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/predicates/`)
                }
            ]
        },
        {
            label: `data/${namespace}/recipes/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/recipes/`)
                }
            ]
        },
        {
            label: `data/${namespace}/tags/blocks/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/tags/blocks/`)
                }
            ]
        },
        {
            label: `data/${namespace}/tags/entity_types/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/tags/entity_types/`)
                }
            ]
        },
        {
            label: `data/${namespace}/tags/fluids/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/tags/fluids/`)
                }
            ]
        },
        {
            label: `data/${namespace}/tags/functions/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/tags/functions/`)
                }
            ]
        },
        {
            label: `data/${namespace}/tags/items/`,
            changes: [
                {
                    type: 'folder',
                    fileUri: Uri.joinPath(dir, `${namespace}/tags/items/`)
                }
            ]
        }
    ];
}