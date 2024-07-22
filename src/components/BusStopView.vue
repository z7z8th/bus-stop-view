<script setup>

defineExpose({ updateBusList })

import { reactive, ref, toRaw } from 'vue'
import { dbGetBusList, dbGetBusStops, dbAddBusLine } from './BusStopStor.js'
import { EventBusTool } from './EventBus.js';
import { BusStopDraw, DrawText, getStopName, getRoadName } from './BusStopDraw.js'

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('res-change', updateRes)
eventBus.subscribe('line-change', (bname) => { busName.value = bname; genBusStopList() })

const busName = ref('')
const busList = ref('')
const busStops = ref([])
const roadName = ref('')
const canvas = ref(null)
const stopIdxSaved = ref(-1)
const colors = reactive({
    busNameBg: '#00ff00', // alpha 4d
    busStopBg: '#0000ff',  // lapha 99
    roadNameBg: '#00ff00',  // alpha 4d
    textColor: '#ffffff',  // alpha ff
})

let busNameSaved = ''

function invertColor(color) {
    // console.log('orig color', color)
    color = color.replace(/^#/, '')
    let width = color.length
    for (let w in [3, 4, 6, 8]) {
        if (width == w)
            break
        if (width < w) {
            color = color.padStart(w, '0')
            break
        }
    }
    let alpha
    if (color.length == 4) {
        alpha = color.substring(3)
        color = color.substring(0, 3)
    } else if (color.length == 8) {
        alpha = color.substring(6)
        color = color.substring(0, 6)
    }
    // console.log('color', color, 'alpha', alpha)
    let mask = (1 << (color.length * 4)) - 1
    let invc = '#' + ((Number('0x' + color) ^ mask) >>> 0).toString(16).padStart(color.length, '0').toUpperCase()
    let fc = invc + (alpha === undefined ? '' : alpha)
    // console.log('color inverted', invc, 'final', fc)
    return fc
}

function reverseStopList() {
    busStops.value.reverse()
    stopIdxSaved.value = -1
    DrawText(canvas.value, '未选中站点');
}

async function genBusStopList() {
    console.log('genBusStopList', busName.value)
    // busStops.value = ['asdf', 'erwer', 'zxcvz']
    let bname = busName.value
    if (!bname)
        return

    if (busNameSaved != bname) {
        busNameSaved = bname
        stopIdxSaved.value = -1
        DrawText(canvas.value, '未选中站点');
    }

    busStops.value = await dbGetBusStops(bname)
}

async function lineChange() {
    // await genBusStopList()
    eventBus.publish('line-change', busName.value)
}

function genBusStopViewByIdx() {
    let idx = stopIdxSaved.value
    let road = roadName.value

    if (idx < 0)
        return

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
    BusStopDraw(document.getElementById('busstopview'), busName.value, stops, allstops[allstops.length - 1], road, colors)
}

function busStopSelChange(event) {
    let li = event.target
    let idx = li.busStopIdx
    console.log('busStopSelChange', li, `idx ${stopIdxSaved.value} -> ${idx}`)
    stopIdxSaved.value = idx

    let prdname = getRoadName(busStops.value[idx]) || ''
    roadName.value = prdname

    genBusStopViewByIdx()
}

function roadChange() {
    console.log('roadChange to ', roadName.value)
    genBusStopViewByIdx()
}

async function saveRoadName() {
    console.log('saveRoadName bus', busName.value, 'idx', stopIdxSaved.value, 'road', roadName.value)
    if (stopIdxSaved.value < 0 || !busName.value)
        return;
    let stname = getStopName(busStops.value[stopIdxSaved.value])
    if (roadName.value)
        stname += '@' + roadName.value
    busStops.value[stopIdxSaved.value] = stname
    dbAddBusLine(busName.value, toRaw(busStops.value))
    eventBus.publish('line-change', busName.value)
}

async function updateBusList() {
    let blist = await dbGetBusList()
    console.log('updateBusList type', typeof blist, 'stopIdxSaved', stopIdxSaved.value)
    busList.value = blist
    await genBusStopList()
    if (stopIdxSaved.value > 0) {
        genBusStopViewByIdx()
    }
}

updateBusList()

function updateRes(res) {
    console.log('resUpdated', res)
    let geom = res.split('x')
    canvas.value.width = `${geom[0]}`
    canvas.value.height = `${Math.min(geom[1], 250)}`
}

setTimeout(() => {
    updateRes('1920x1080');
    DrawText(canvas.value, '未选中线路');
}, 0)

function colorChange() {
    console.log('colorChange', colors, typeof (colors))
    genBusStopViewByIdx()
}
/*
https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file

    < (less than)
    > (greater than)
    : (colon)
    " (double quote)
    / (forward slash)
    \ (backslash)
    | (vertical bar or pipe)
    ? (question mark)
    * (asterisk)

*/
function normWinFileName(name) {
    return name.replace(/[<>:"/\\|?*]/g, '_')
}

function saveImage(imageData, imageName) {
    console.log('saveImage', imageName)
    imageName = normWinFileName(imageName)
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link)
    link.setAttribute('download', imageName + '.png');
    link.setAttribute('href', imageData.replace("image/png", "image/octet-stream"));
    link.click();
}

function saveAsPic() {
    if (stopIdxSaved.value < 0) {
        return
    }
    let picName = busName.value + '路'
    if (stopIdxSaved.value >= 0) {
        picName += `-第${stopIdxSaved.value + 1}站-${busStops.value[stopIdxSaved.value]}`
    }
    saveImage(canvas.value.toDataURL(), picName)
}
</script>

<template>
    <h2>生成线路图</h2>
    <div>
        <div class="input-group mb-3">
            <label class="input-group-text text-primary" for="bus-name-sel">线路名</label>
            <select id="bus-name-sel" class="form-select" aria-label="选择线路" v-model="busName" @change="lineChange">
                <option value="" selected disabled hidden>选择线路</option>
                <option v-for="bus of busList" :key="bus">{{ bus }}</option>
            </select>
        </div>
        <br>
        <div id="stop-list" class="">
            <div class="input-group mb-3">
                <label class="input-group-text text-primary">经停站(点击站名生成对应图片)</label>
                <button id="reverseLine" class="btn btn-primary ms-3" @click="reverseStopList">换向</button>
            </div>
            <ol class="form-control w-auto">
                <li class="form-control" v-for="(stop, index) of busStops" :key="index" .busStopIdx="index"
                    @click="busStopSelChange" :class="{ li_active: index == stopIdxSaved }">
                    {{ stop }}
                </li>
            </ol>
        </div>
        <div class="input-group mb-3">
            <label class="input-group-text text-primary" for="road-name">站点所在道路 @</label>
            <input type="text" id="road-name" class="form-control" v-model="roadName" @change="roadChange"
                @keyup="roadChange" placeholder="输入对应公交站的路名，比如：北京路" size="28">
            <button class="btn btn-primary" @click="saveRoadName">保存道路名</button>
        </div>
        <div class="input-group mb-3">
            <label class="input-group-text text-primary me-3">修改颜色</label>
            <label class="input-group-text me-3"
                :style="{ backgroundColor: colors.busNameBg, color: invertColor(colors.busNameBg) }"
                for="busNameBg">线路背景颜色</label>
            <input type="color" id="busNameBg" class="form-control" hidden v-model="colors.busNameBg"
                @change="colorChange">

            <label class="input-group-text me-3"
                :style="{ backgroundColor: colors.busStopBg, color: invertColor(colors.busStopBg) }"
                for="busStopBg">站点背景颜色</label>
            <input type="color" id="busStopBg" class="form-control" hidden v-model="colors.busStopBg"
                @change="colorChange">

            <label class="input-group-text me-3"
                :style="{ backgroundColor: colors.roadNameBg, color: invertColor(colors.roadNameBg) }"
                for="roadNameBg">路名背景颜色</label>
            <input type="color" id="roadNameBg" class="form-control" hidden v-model="colors.roadNameBg"
                @change="colorChange">

            <label class="input-group-text rounded-end fw-bold"
                :style="{ color: colors.textColor, backgroundColor: invertColor(colors.textColor) + '' }"
                for="textColor">字体颜色</label>
            <input type="color" id="textColor" class="form-control" hidden v-model="colors.textColor"
                @change="colorChange">
        </div>
        <div class="view">
            <canvas ref="canvas" id="busstopview"></canvas>
            <button class="btn btn-primary float-end m-2" @click="saveAsPic" :disabled="stopIdxSaved < 0">保存成图片</button>
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

.li_active {
    background-color: magenta !important;
}

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
    background: rgba(255, 255, 255, 0);
    width: 100%;
}

/*
input[type="color"] {
    width: 10% !important;
} */
</style>