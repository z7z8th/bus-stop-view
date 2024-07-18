<script setup>
import { ref } from 'vue'
import { EventBusTool } from './EventBus.js';

const screenRes = ref('1920x1080')

const eventBus = EventBusTool.getEventBus()

function updateRes() {
    eventBus.publish('res-change', screenRes.value)
}

setTimeout(updateRes, 0)

// export default {
//     screenRes
// }
</script>
<template>
    <h2>屏幕分辨率</h2>
    <select v-model="screenRes" @change="updateRes">
        <option>1280x720</option>
        <option selected>1920x1080</option>
        <option>2560x1440</option>
        <option>3840x2160</option>
    </select>
</template>
