<template>
    <div class="file-uploader-container">
        <div class="file-uploader drag-drop-area" @dragover.prevent @dragenter.prevent @drop="handleDrop">
            <label class="file-input-label">
                <input type="file" @change="handleFileChange" ref="fileInput" style="display: none;" multiple
                    accept=".zip" />
                <span class="file-input-text">{{ buttonText }}</span>
            </label>
            <p class="drag-drop-text">Drag & Drop ZIP files here or click to select</p>
            <div v-if="files.length > 0" class="file-list">
                <div v-for="file in files" :key="file.name" class="file-item">{{ file.name }}</div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { useToast } from 'vue-toastification';

export default {
    name: 'FileUploader',
    props: {
        buttonText: {
            type: String,
            default: 'Upload ZIP Files'
        }
    },
    data() {
        return {
            files: []
        };
    },
    methods: {
        handleFileChange(event) {
            const selectedFiles = Array.from(event.target.files).filter(file => file.type === 'application/zip');
            this.addFiles(selectedFiles);
        },
        handleDrop(event) {
            event.preventDefault();
            const droppedFiles = Array.from(event.dataTransfer.files).filter(file => file.type === 'application/zip');
            this.addFiles(droppedFiles);
        },
        addFiles(newFiles) {
            if (newFiles.length + this.files.length > 2) {
                this.showError('You can only upload up to 2 ZIP files.');
            } else {
                this.files = this.files.concat(newFiles).slice(0, 2);
                this.$emit('files-selected', this.files);
            }
        },
        showError(message) {
            const toast = useToast();
            toast.error(message);
        }
    }
};
</script>
  
<style scoped>
.file-uploader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 20px;
}

.file-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 2px dashed #6e7681;
    border-radius: 10px;
    width: 100%;
    max-width: 600px;
}

.file-input-label {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.file-input-label:hover {
    background-color: #0056b3;
}

.file-input-text {
    cursor: pointer;
}

.drag-drop-area {
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s;
}

.drag-drop-area:hover {
    background-color: #f0f0f0;
}

.drag-drop-text {
    color: #007bff;
    font-size: 16px;
    margin-top: 10px;
}

.file-list {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
    width: 100%;
}

.file-item {
    padding: 5px 10px;
    background-color: #e9ecef;
    margin-top: 5px;
    border-radius: 3px;
    width: max-content;
}
</style>
  