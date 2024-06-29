<template>
    <div class="file-uploader drag-drop-area" @dragover.prevent @dragenter.prevent @drop="handleDrop">
        <label :for="fileInputId" class="file-input-label">
            <input type="file" :id="fileInputId" @change="handleFileChange" ref="fileInput" style="display: none;" />
            <span class="file-input-text">{{ buttonText }}</span>
        </label>
        <p class="drag-drop-text">{{ dropText }}</p>
        <p v-if="selectedFileName" class="selected-file-text">Selected file: {{ selectedFileName }}</p>
    </div>
</template>
  
<script>
export default {
    name: 'FileUploader',
    props: {
        buttonText: {
            type: String,
            default: 'Upload File'
        },
        uploaderId: {
            type: String,
            required: true
        },
        dropText: {
            type: String,
            default: 'Drag & Drop file here'
        }
    },
    data() {
        return {
            selectedFileName: ''
        };
    },
    computed: {
        fileInputId() {
            return `fileInput_${this.uploaderId}`;
        }
    },
    methods: {
        handleFileChange(event) {
            const files = event.target.files;
            if (files.length > 0) {
                this.selectedFileName = files[0].name;
                this.$emit('file-selected', { file: files[0], uploaderId: this.uploaderId });
            }
        },
        handleDrop(event) {
            event.preventDefault();
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                this.selectedFileName = files[0].name;
                this.$emit('file-selected', { file: files[0], uploaderId: this.uploaderId });
            }
        }
    }
};
</script>
  
<style scoped>
.file-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    margin: 1rem;
    border: .2rem dashed #6e7681;
    width: 100vw;
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
    margin-top: 10px;
    padding: 20px;
    border: 2px dashed #007bff;
    border-radius: 5px;
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
}

.selected-file-text {
    margin-top: 10px;
    font-weight: bold;
}
</style>
  