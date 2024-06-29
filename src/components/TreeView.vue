<template>
    <ul class="tree">
        <li v-for="item in files" :key="item.name">
            <div class="tree-item">
                <summary v-if="item.children.length" @click="toggleExpand(item)" :class="{ 'expanded': item.expanded }">
                </summary>
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
    created() {
        this.updateModifiedState(this.files);
    },
    methods: {
        handleClick(item) {
            if (!item.children.length) {
                this.$emit('file-click', item.name);
            }
        },
        toggleExpand(item) {
            item.expanded = !item.expanded;
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
    /* Ensure full width */
    text-align: left;
}

.tree-item {
    display: flex;
    /* align-items: center;
    padding: 8px 16px;  */
    margin-top: 8px;
    /* Adjust padding for item */
    /* border-bottom: .1px solid #444; */
    /* box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px; */
    /* Dark border between items */
}

.changed {
    /* Darker grey for changed files */
    color: #000000;
    /* White text */
}

.changed::before {
    content: '〽️ ';
}

.file-name {
    flex: 1;
    /* Take remaining space */
    overflow: hidden;
    /* Hide overflow text */
    text-overflow: ellipsis;
    /* Ellipsis for overflow text */
    white-space: nowrap;
    /* No wrapping */
    padding-left: 8px;
    /* Padding for file name */
    cursor: default;
    text-align: left;
    /* Pointer cursor on hover */
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
    /* Ensure no left margin for top-level items */
}

.tree-view ul {
    padding-left: 20px;
    /* Adjust padding for nested tree views */
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
    background: #ddd;
}

.tree summary::before {
    z-index: 1;
    background: #696 url('./assets/expand-collapse.svg') 0 0;
}
</style>
