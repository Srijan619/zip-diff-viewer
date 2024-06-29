// file-icons.js
import * as vscodeIcons from 'vscode-icons-js';

export function getIconForFile(fileName) {
    const icon = vscodeIcons.getIconForFile(fileName) || vscodeIcons.DEFAULT_FILE;
    return "https://dderevjanik.github.io/vscode-icons-js-example/icons/" + icon;
}

export function getIconForFolder(isOpen = false) {
    const icon = isOpen ? vscodeIcons.DEFAULT_FOLDER_OPENED : vscodeIcons.DEFAULT_FOLDER;

    return "https://dderevjanik.github.io/vscode-icons-js-example/icons/" + icon;
}

