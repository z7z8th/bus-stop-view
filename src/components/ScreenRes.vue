<script setup>
import { ref } from 'vue'
const screenRes = ref('1920x1080')


// export default {
//     screenRes
// }
</script>
<template>
    <h2>屏幕分辨率</h2>
    <select :model="screenRes">
        <option>1280x720</option>
        <option selected>1920x1080</option>
        <option>2560x1440</option>
        <option>3840x2160</option>
    </select>
</template>