<script setup>

defineExpose({ updateBusList })

import { ref } from 'vue'
import { busGetBusList, busGetBusStops } from './BusStopStor.js'
const busName = ref('')
const busList = ref('')
const busStops = ref([])

async function genBusStopList() {
    console.log('genBusStopList')
    // busStops.value = ['asdf', 'erwer', 'zxcvz']
    busStops.value = await busGetBusStops(busName.value)
}

function genBusStopView(event) {
    console.log('genBusStopView', event.target)
    console.log('genBusStopView', event.target.__vnode.key)
}

async function updateBusList() {
    let blist = await busGetBusList()
    console.log('updateBusList type', typeof blist)
    busList.value = blist
}

updateBusList()

</script>

<template>
    <h2>生成线路图</h2>
    <div>
        线路名：
        <select v-model="busName" @change="genBusStopList">
            <option v-for="bus of busList" :key="bus">{{ bus }}</option>
        </select>
        <br>
        经停站：
        <div>
            <ol>
                <li v-for="(stop, index) of busStops" :key="index" @click="genBusStopView">{{ stop
                    }}
                </li>
            </ol>
        </div>
        <div>
            <canvas id="busstopview"></canvas>
        </div>
        <!-- <button id="save" @onclick="genStopView">生成线路图</button> -->
    </div>
</template>

<style scoped>
button {
    float: right;
}

ol,
ul {
    height: min-content;
}

li {
    display: inline-block;
    writing-mode: vertical-lr;
    text-orientation: upright;
    text-align: center;
    text-justify: inter-word;
    vertical-align: top;
    min-height: calc(10%);
    padding: 0.4rem 0.4rem;
}

/*
li::after {
    content: "";
    display: inline-block;
    width: 100%;
} */

li:nth-child(2n+1) {
    background: rgb(101, 178, 180);
}

li:nth-child(2n) {
    background: rgb(147, 101, 180);
}

canvas {
    border: 1px solid gray;
}
</style>