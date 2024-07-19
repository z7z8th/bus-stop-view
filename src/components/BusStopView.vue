<script setup>

defineExpose({ updateBusList })

import { ref } from 'vue'
import { busGetBusList, busGetBusStops } from './BusStopStor.js'
import { EventBusTool } from './EventBus.js';
import { BusStopDraw } from './BusStopDraw.js'

const busName = ref('')
const busList = ref('')
const busStops = ref([])
const roadName = ref('')
const canvas = ref(null)
// const width = ref('1920px')
// const height = ref('250px')
let stopIdx = 0

async function genBusStopList() {
    console.log('genBusStopList')
    // busStops.value = ['asdf', 'erwer', 'zxcvz']
    busStops.value = await busGetBusStops(busName.value)
}

function _genBusStopView(idx, road) {
    let allstops = busStops.value
    let stops
    if (idx == 0 || idx == allstops.length - 1) {
        // begin and end stops
        stops = allstops.slice(idx, idx + 1)
    } else {
        // intermediate stops
        stops = allstops.slice(idx - 1, idx + 2)
    }

    console.log('_genBusStopView', stops, road)
    BusStopDraw(document.getElementById('busstopview'), busName.value, stops, allstops[allstops.length - 1], road)
}

function genBusStopView(event) {
    let li = event.target
    let idx = li.__vnode.key
    stopIdx = idx
    console.log('genBusStopView', li, idx)
    _genBusStopView(idx, roadName.value)
}

function roadChange() {
    _genBusStopView(stopIdx, roadName.value)
}

async function updateBusList() {
    let blist = await busGetBusList()
    console.log('updateBusList type', typeof blist)
    busList.value = blist
}

updateBusList()

function updateRes(res) {
    console.log('resUpdated', res)
    let geom = res.split('x')
    canvas.value.width = `${geom[0]}`
    canvas.value.height = `${Math.min(geom[1], 250)}`
}

setTimeout(updateRes, 0, '1920x1080')

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('res-change', updateRes)

</script>

<template>
    <h2>生成线路图</h2>
    <div>
        线路名：
        <select v-model="busName" @change="genBusStopList">
            <option v-for="bus of busList" :key="bus">{{ bus }}</option>
        </select>
        <br>
        经停站：(点击站名生成对应图片)
        <div>
            <ol>
                <li v-for="(stop, index) of busStops" :key="index" @click="genBusStopView">
                    {{ stop }}
                </li>
            </ol>
        </div>
        站点所在道路名：<input type="text" v-model="roadName" @change="roadChange" @keyup="roadChange"
            placeholder="输入对应公交站的路名，比如：北京路" size="28">
        <div>
            <canvas ref="canvas" id="busstopview"></canvas>
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
    margin: 0.2rem;

    font-size: x-large;
    color: lightcyan;
}

li:hover {
    cursor: pointer;
}

li:active {
    border: 3px solid magenta;
}

/*
li::after {
    content: "";
    display: inline-block;
    width: 100%;
} */

li:nth-child(2n+1) {
    background-color: rgba(101, 178, 180, 128);
}

li:nth-child(2n) {
    background-color: rgba(147, 101, 180, 128);
}

li {
    border-bottom: 1px sold green;
}

canvas {
    border: 1px solid gray;
    background: rgba(255, 255, 255, 255);
}
</style>