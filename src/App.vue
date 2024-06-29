<template>
  <div id="app">
    <h1>ZIP File Diff Viewer</h1>
    <!-- <div class="file-upload-container">
      <FileUploader buttonText="Upload ZIP File 1" uploaderId="file1" @file-selected="handleFileSelected" />
      <FileUploader buttonText="Upload ZIP File 2" uploaderId="file2" @file-selected="handleFileSelected" />
    </div> -->
    <FileUploader buttonText="Upload ZIP Files" @files-selected="handleFilesSelected" />
    <button @click="compareZips">Compare ZIPs</button>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="files-container">
      <div class="file-list" v-if="nestedFiles1.length">
        <h2>Files in ZIP 1</h2>
        <tree-view :files="nestedFiles1" :diff-results="diffResults" @file-click="showDiff"></tree-view>
      </div>
      <div class="file-list" v-if="nestedFiles2.length">
        <h2>Files in ZIP 2</h2>
        <tree-view :files="nestedFiles2" :diff-results="diffResults" @file-click="showDiff"></tree-view>
      </div>
    </div>
    <modal v-if="diffResult" :title="'Diff Result for ' + currentFile" @close="closeModal">
      <div v-html="diffResult"></div>
    </modal>
    <!-- <tree-view :files="nestedFiles()" :diff-results="diffResults" @file-click="showDiff"></tree-view> -->
  </div>
</template>

<script>
import JSZip from 'jszip';
import { createTwoFilesPatch } from 'diff';
import { html as diff2Html } from 'diff2html';
import TreeView from './components/TreeView.vue';
import FileUploader from './components/FileUploader.vue';
import Modal from './components/Modal.vue';
import { useToast } from "vue-toastification";

export default {
  components: {
    TreeView,
    FileUploader,
    Modal
  },
  data() {
    return {
      file1: null,
      file2: null,
      nestedFiles1: [],
      nestedFiles2: [],
      diffResults: [],
      currentFile: '',
      diffResult: '',
      loading: false
    };
  },
  methods: {
    handleFileChange(event, fileKey) {
      this[fileKey] = event.target.files[0];
    },
    nestedFiles() {
      return [{
        "name": "configuration_export 35",
        "children": [
          {
            "name": "DataSources",
            "children": [
              {
                "name": "dataSource_orgParams.yaml",
                "children": [],
                "expanded": true
              },
              {
                "name": "dataSource_communication_preference.yaml",
                "children": [],
                "expanded": true
              }
            ],
            "expanded": true
          }
        ],
        "expanded": true
      }]

    },
    handleFilesSelected(files) {
      this.file1 = files[0];
      this.file2 = files[1];
    },
    async compareZips() {
      const toast = useToast();
      if (!this.file1 || !this.file2) {
        toast.error('Please upload two ZIP files.');
        return;
      }
      if (this.file1 && this.file2) {
        this.loading = true;
        const zip1 = await this.extractZip(this.file1);
        const zip2 = await this.extractZip(this.file2);
        this.nestedFiles1 = this.buildNestedStructure(Object.keys(zip1));
        console.log(this.nestedFiles1)
        this.nestedFiles2 = this.buildNestedStructure(Object.keys(zip2));
        this.diffResults = this.generateDiff(zip1, zip2);
        this.loading = false;
      }
    },
    async extractZip(file) {
      const jszip = new JSZip();
      const zipContent = await jszip.loadAsync(file);
      const files = {};

      for (const [path, file] of Object.entries(zipContent.files)) {
        if (!file.dir && this.isValidFile(path)) {
          const content = await file.async('text');
          files[path] = content;
        }
      }

      return files;
    },
    isValidFile(path) {
      const invalidFiles = [
        '__MACOSX',
        '.DS_Store',
      ];
      return !invalidFiles.some(invalidFile => path.includes(invalidFile));
    },
    buildNestedStructure(paths) {
      const tree = {};

      paths.forEach(path => {
        const parts = path.split('/');
        let current = tree;

        parts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = index === parts.length - 1 ? null : {};
          }
          current = current[part];
        });
      });

      return this.convertToNestedArray(tree);
    },
    convertToNestedArray(tree) {
      return Object.keys(tree).map(key => {
        return {
          name: key,
          children: tree[key] ? this.convertToNestedArray(tree[key]) : [],
          expanded: true // Expand all nodes by default
        };
      });
    },
    generateDiff(zip1, zip2) {
      debugger
      const allFiles = new Set([...Object.keys(zip1), ...Object.keys(zip2)]);
      const sortedFiles = Array.from(allFiles).sort();
      const diffResults = [];

      sortedFiles.forEach((file) => {
        const content1 = zip1[file] || '';
        const content2 = zip2[file] || '';
        let html;

        if (content1 && content2) {
          const diff = createTwoFilesPatch(file, file, content1, content2);
          html = diff2Html(diff, {
            inputFormat: 'diff',
            showFiles: true,
            matching: 'lines',
            outputFormat: 'side-by-side',
          });
        } else if (content1) {
          html = '<div class="unique-file">Only in ZIP 1</div>';
        } else {
          html = '<div class="unique-file">Only in ZIP 2</div>';
        }

        diffResults.push({ file, html });
      });

      return diffResults;
    }
    ,

    showDiff(file) {
      console.log("Showing diff...", this.diffResults);

      // Extract the last part of the file path
      const fileName = file.substring(file.lastIndexOf('/') + 1);

      // Find the diff result where the file name matches
      const diff = this.diffResults.find(diff => {
        // Extract the last part of the file path stored in diff.file
        const diffFileName = diff.file.substring(diff.file.lastIndexOf('/') + 1);
        return diffFileName === fileName;
      });

      if (diff) {
        this.currentFile = file;
        this.diffResult = diff.html;
      }
    },
    closeModal() {
      this.diffResult = '';
    }
  },
};
</script>

<style>
@import 'diff2html/bundles/css/diff2html.min.css';

body {
  font-family: Arial, sans-serif;
}

#app {
  margin: 0 auto;
}

.loading {
  text-align: center;
  font-size: 24px;
  margin-top: 20px;
}

.files-container {
  display: flex;
  justify-content: space-between;
}

.file-list {
  width: 45%;
}

.diff-result {
  margin-top: 20px;
}

.unique-file {
  background-color: #f0f0f0;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 5px;
}

.file-upload-container {
  display: flex;
}

/* Override styles for black and white theme */
.d2h-file-header,
.d2h-file-side {
  background-color: white !important;
  color: black !important;
}

.d2h-files-diff .d2h-code-line {
  background-color: transparent !important;
}

.d2h-files-diff .d2h-code-side-line {
  background-color: transparent !important;
}

.d2h-code-side-linenumber {
  color: black !important;
}

.d2h-code-line-prefix {
  color: black !important;
}

.d2h-code-line-ctn {
  color: black !important;
}

.d2h-code-side-linenumber {
  color: black !important;
}

.d2h-code-side-line-prefix {
  color: black !important;
}

.d2h-code-side-line-ctn {
  color: black !important;
}
</style>
