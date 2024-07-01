<template>
    <ul class="tree">
        <li v-for="item in files" :key="item.name" :style="getIconStyle(item)">
            <div class="tree-item">
                <summary v-if="item.children.length" @click="toggleExpand(item)" :class="{ 'expanded': item.expanded }">
                    <span v-if="item.loading">
                        <img src="../assets/spinner.gif" alt="loading" class="spinner-icon" />
                    </span>
                </summary>
                <!-- <img :src="getIcon(item)" alt="" class="file-icon" /> -->
                <span @click="handleClick(item)" :class="{ 'changed': isChanged(item), 'file-name': true }">
                    {{ item.name }}
                    <span v-if="item.modifiedCount" class="modified-count">{{ item.modifiedCount }}</span>
                </span>
            </div>
            <TreeView v-if="item.children.length && item.expanded" :files="item.children" :diff-results="diffResults"
                @file-click="$emit('file-click', $event)">
            </TreeView>
        </li>
    </ul>
</template>

<script>
import { getIconForFile, getIconForFolder } from '../utils/fileIcons';

export default {
    name: 'TreeView',
    props: {
        files: {
            type: Array,
            required: true
        },
        diffResults: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            previousFiles: null
        };
    },
    watch: {
        files: {
            handler(newFiles, oldFiles) {
                // Check if there are previous files and if they have changed
                if (!this.previousFiles || this.previousFiles !== oldFiles) {
                    this.autoExpandModifiedFolders(newFiles); // Expand modified folders
                    this.previousFiles = oldFiles; // Update previousFiles with oldFiles
                }
            },
            deep: true // Watch changes deeply in the files array
        }
    },
    created() {
        // Initial setup to detect modified files
        this.updateModifiedState(this.files);
    },
    methods: {
        handleClick(item) {
            if (!item.children.length) {
                this.$emit('file-click', item.name);
            }
        },
        toggleExpand(item) {
            if (!item.children.length) return; // Only toggle if it's a directory

            if (item.expanded) {
                item.expanded = false;
            } else {
                item.loading = true;
                setTimeout(() => {
                    item.expanded = true;
                    item.loading = false;
                }, 500); // Adjust the timeout duration as needed
            }
        },
        autoExpandModifiedFolders(files) {
            files.forEach(file => {
                if (file.children && file.children.length > 0) {
                    this.autoExpandModifiedFolders(file.children);
                    // Expand the folder if it has modified children
                    if (file.children.some(child => child.modified)) {
                        file.expanded = true;
                    }
                }
            });
        },
        isChanged(item) {
            // Check if the file exists in diffResults and has changes
            return this.diffResults.some(diff => {
                // Extract the last part of the file path stored in diff.file
                const diffFileName = diff.file.substring(diff.file.lastIndexOf('/') + 1);
                return diffFileName === item.name && !diff.html.includes('unique-file') && !diff.html.includes('File without changes');
            });
        },
        updateModifiedState(files) {
            files.forEach(file => {
                if (file.children && file.children.length > 0) {
                    this.updateModifiedState(file.children);
                    file.modifiedCount = file.children.reduce((count, child) => count + (child.modified ? 1 : child.modifiedCount || 0), 0);
                    file.modified = file.modifiedCount > 0;
                } else {
                    file.modified = this.isChanged(file);
                }
            });
        },
        getIcon(item) {
            if (item.children && item.children.length > 0) {
                return getIconForFolder(item.expanded);
            }
            return getIconForFile(item.name);
        },
        getIconStyle(item) {
            return {
                '--icon-url': `url(${this.getIcon(item)})`
            }
        }
    }
};
</script>

<style scoped>
.tree-view {
    list-style-type: none;
    padding: 0;
    margin: 0;
    font-family: Arial, sans-serif;
    text-align: left;
}

.tree-item {
    display: flex;
    margin-top: 8px;
}

.changed {
    color: #000000;
}

.changed::before {
    content: '〽️ ';
}

.file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 8px;
    cursor: default;
    text-align: left;
}

.modified-count {
    display: inline-block;
    background-color: #ffcc00;
    color: #333;
    padding: 2px 6px;
    border-radius: 20%;
    margin-left: 5px;
    font-size: 0.8em;
}

.tree-view>li {
    margin-left: 0;
}

.tree-view ul {
    padding-left: 20px;
}

.tree {
    --spacing: 1.5rem;
    --radius: 10px;
}

.tree li {
    display: block;
    position: relative;
    padding-left: calc(2 * var(--spacing) - var(--radius) - 2px);
}

.tree ul {
    margin-left: calc(var(--radius) - var(--spacing));
    padding-left: 0;
}

.tree ul li {
    border-left: 2px solid #ddd;
}

.tree ul li:last-child {
    border-color: transparent;
}

.tree ul li::before {
    content: '';
    display: block;
    position: absolute;
    top: calc(var(--spacing) / -2);
    left: -2px;
    width: calc(var(--spacing) + 2px);
    height: calc(var(--spacing) + 1px);
    border: solid #ddd;
    border-width: 0 0 2px 2px;
}

.tree summary {
    display: block;
    cursor: pointer;
}

.tree summary::marker,
.tree summary::-webkit-details-marker {
    display: none;
}

.tree summary:focus {
    outline: none;
}

.tree summary:focus-visible {
    outline: 1px dotted #000;
}

.tree li::after,
.tree summary::before {
    content: '';
    display: block;
    position: absolute;
    top: calc(var(--spacing) / 2 - var(--radius));
    left: calc(var(--spacing) - var(--radius) - 1px);
    width: calc(2 * var(--radius));
    height: calc(2 * var(--radius));
    border-radius: 50%;
}

.tree li::after {
    background: var(--icon-url);
}

.tree summary::before {
    z-index: 1;
    background: var(--icon-url);
}

.spinner-icon {
    width: 16px;
    height: 16px;
    vertical-align: middle;
}

.file-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    vertical-align: middle;
}
</style>
