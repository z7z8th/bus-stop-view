<script setup>

defineExpose({ updateBusList })

import { ref } from 'vue'
import { busGetBusList, busGetBusStops } from './BusStopStor.js'
import { EventBusTool } from './EventBus.js';
import { BusStopDraw } from './BusStopDraw.js'

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('res-change', updateRes)

const busName = ref('')
const busList = ref('')
const busStops = ref([])
const roadName = ref('')
const canvas = ref(null)
// const width = ref('1920px')
// const height = ref('250px')
let busNameSaved = ''
let stopIdxSaved = -1

async function genBusStopList() {
    console.log('genBusStopList', typeof (busName.value))
    // busStops.value = ['asdf', 'erwer', 'zxcvz']
    let bname = busName.value
    if (!bname)
        return

    if (busNameSaved != bname) {
        busNameSaved = bname
        stopIdxSaved = -1
        eventBus.publish('line-change', bname)
    }
    busStops.value = await busGetBusStops(bname)
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
    let idx = li.busStopIdx
    console.log('genBusStopView', li, `idx ${stopIdxSaved} -> ${idx}`)
    stopIdxSaved = idx
    _genBusStopView(idx, roadName.value)
}

function roadChange() {
    _genBusStopView(stopIdxSaved, roadName.value)
}

async function updateBusList() {
    let blist = await busGetBusList()
    console.log('updateBusList type', typeof blist, 'stopIdxSaved', stopIdxSaved)
    busList.value = blist
    await genBusStopList()
    if (stopIdxSaved > 0) {
        _genBusStopView(stopIdxSaved, roadName.value)
    }
}

updateBusList()

function updateRes(res) {
    console.log('resUpdated', res)
    let geom = res.split('x')
    canvas.value.width = `${geom[0]}`
    canvas.value.height = `${Math.min(geom[1], 250)}`
}

setTimeout(updateRes, 0, '1920x1080')

function saveImage(imageData, imageName) {
    console.log('saveImage', imageName)
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link)
    link.setAttribute('download', imageName + '.png');
    link.setAttribute('href', imageData.replace("image/png", "image/octet-stream"));
    link.click();
}
// saveImage(canvas.value.toDataURL(), "myName")

function saveAsPic() {
    if (stopIdxSaved < 0) {
        return
    }
    let picName = busName.value + '路'
    if (stopIdxSaved >= 0) {
        picName += `-第${stopIdxSaved + 1}站-${busStops.value[stopIdxSaved]}`
    }
    saveImage(canvas.value.toDataURL(), picName)
}
</script>

<template>
    <h2>生成线路图</h2>
    <div>
        <div class="input-group mb-3">
            <label class="input-group-text text-primary" for="bus-name-sel">线路名</label>
            <select id="bus-name-sel" class="form-select" aria-label="选择线路" v-model="busName" @change="genBusStopList">
                <option value="" selected disabled hidden>选择线路</option>
                <option v-for="bus of busList" :key="bus">{{ bus }}</option>
            </select>
        </div>
        <br>
        <div id="stop-list" class="">
            <label class="form-control text-primary">经停站(点击站名生成对应图片)</label>
            <ol class="form-control w-auto">
                <li class="form-control" v-for="(stop, index) of busStops" :key="index" .busStopIdx="index"
                    @click="genBusStopView">
                    {{ stop }}
                </li>
            </ol>
        </div>
        <div class="input-group mb-3">
            <label class="input-group-text text-primary" for="road-name">站点所在道路名</label>
            <input type="text" id="road-name" class="form-control" v-model="roadName" @change="roadChange"
                @keyup="roadChange" placeholder="输入对应公交站的路名，比如：北京路" size="28">
        </div>
        <div>
            <canvas ref="canvas" id="busstopview"></canvas>
            <button class="btn btn-primary float-end m-2" @click="saveAsPic">保存成图片</button>
        </div>
        <hr class="invisible">
    </div>
</template>

<style scoped>
button {
    float: right;
    position: relative;
}

ol,
ul {
    width: fit-content;
    height: fit-content;
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