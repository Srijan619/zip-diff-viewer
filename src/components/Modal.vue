<template>
    <div class="modal" @click.self="$emit('close')">
        <div class="modal-content">
            <div class="modal-header">
                <h2>{{ title }}</h2>
            </div>
            <span class="close" @click="$emit('close')">x</span>
            <div class="modal-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'Modal',
    props: {
        title: {
            type: String,
            required: true
        }
    }
};
</script>
  
<style scoped>
.modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal-content {
    background-color: #fefefe;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 90%;
    max-height: 90%;
    position: relative;
    overflow: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.modal-header h2 {
    margin: 0;
}

.close {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: #aaa;
    font-family: fantasy;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
}
</style>
