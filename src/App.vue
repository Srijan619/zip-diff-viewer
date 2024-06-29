<template>
  <div id="app">
    <h1>Zip Diff Viewer</h1>
    <FileUploader buttonText="Upload ZIP Files" @files-selected="handleFilesSelected" />
    <button @click="compareZips">Compare ZIPs</button>
    <div v-if="loading" class="loading">
      <img src="./assets/spinner.gif" alt="loading" class="spinner-icon" />
    </div>
    <div v-else class="files-container">
      <div class="file-list" v-if="nestedFiles1.length">
        <h2 class="uploaded-file-name">Files in ZIP {{ file1.name }}</h2>
        <tree-view :files="nestedFiles1" :diff-results="diffResults" @file-click="showDiff"></tree-view>
      </div>
      <div class="file-list" v-if="nestedFiles2.length">
        <h2 class="uploaded-file-name">Files in ZIP {{ file2.name }}</h2>
        <tree-view :files="nestedFiles2" :diff-results="diffResults" @file-click="showDiff"></tree-view>
      </div>
    </div>
    <modal v-if="diffResult" :title="'Diff Result for ' + currentFile" @close="closeModal">
      <div v-html="diffResult"></div>
    </modal>
  </div>
</template>

<script>
import JSZip from 'jszip';
import { createTwoFilesPatch } from 'diff';
import { html as diff2Html } from 'diff2html';
import TreeView from './components/TreeView.vue';
import FileUploader from './components/FileUploader.vue';
import Modal from './components/Modal.vue';
import { useToast } from 'vue-toastification';

export default {
  components: {
    TreeView,
    FileUploader,
    Modal,
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
      loading: false,
    };
  },
  methods: {
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

      try {
        this.loading = true;
        const [zip1, zip2] = await Promise.all([
          this.extractZip(this.file1),
          this.extractZip(this.file2),
        ]);

        this.nestedFiles1 = this.buildNestedStructure(Object.keys(zip1));
        this.nestedFiles2 = this.buildNestedStructure(Object.keys(zip2));
        this.diffResults = this.generateDiff(zip1, zip2);
      } catch (error) {
        console.error('Error comparing ZIPs:', error);
        toast.error('Failed to compare ZIP files. Please try again.');
      } finally {
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
      const invalidFiles = ['__MACOSX', '.DS_Store'];
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
          expanded: false // Expand all nodes by default
        };
      });
    },
    generateDiff(zip1, zip2) {
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
          html = `<div class="unique-file">Only in ZIP ${this.file1.name} </div>`;
        } else {
          html = `<div class="unique-file">Only in ZIP ${this.file2.name} </div>`;
        }

        diffResults.push({ file, html });
      });

      return diffResults;
    },
    showDiff(file) {
      const fileName = file.substring(file.lastIndexOf('/') + 1);
      const diff = this.diffResults.find(diff => diff.file.endsWith(fileName));

      if (diff) {
        this.currentFile = file;
        this.diffResult = diff.html;
      }
    },
    closeModal() {
      this.diffResult = '';
    },
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

.uploaded-file-name {
  font-size: small;
  text-align: left;
  padding-bottom: .5rem;
  margin-left: 3.5rem;
  border-bottom: 1px solid black;
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
