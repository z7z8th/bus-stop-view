<script setup>

defineExpose({ updateBusList })

import { reactive, ref, toRaw } from 'vue'

import { dbGetBusList } from './BusStopStor.js'
// import { EventBusTool } from './EventBus.js';
import { DrawTextEx } from './BusStopDraw.js'
import { invertColor, splitColor, alphaToHex } from './color.js';
import { saveAs } from './file.js'

// const eventBus = EventBusTool.getEventBus()
// eventBus.subscribe('res-change', updateRes)

const busName = ref('888')
const busList = ref([])
const canvas_gridLED = ref(null)
const canvas_preview = ref(null)
const showCanvasPreview = ref(false)
const fontInfo = reactive({
    bgColor: '#000000',  // alpha 4d
    textColor: 'rgb(229, 165, 10)',  // alpha ff
    alpha: 100,
    fontSize: 180,
})
let defaultFontInfo = Object.assign({}, toRaw(fontInfo));

async function updateBusList() {
    let blist = await dbGetBusList()
    console.log('updateBusList type', typeof blist)
    busList.value = blist
}

updateBusList()

// function updateRes(res) {
//     console.log('resUpdated', res)
//     let geom = res.split('x')
//     canvas_gridLED.value.width = `${geom[0]}`
//     canvas_gridLED.value.height = `${Math.min(geom[1], 450)}`
// }

function updateCanvasGeom(w, h) {
    w = w || canvas_gridLED.value.offsetWidth  // || fontInfo.fontSize*2
    h = h || canvas_gridLED.value.offsetHeight  // || fontInfo.fontSize*1.5
    console.log(`updateCanvasGeom ${w}x${h}`)
    canvas_gridLED.value.width = w
    canvas_gridLED.value.height = h
}

setTimeout(() => {
    // updateRes('1920x1080');
    // DrawTextEx(canvas_gridLED.value, '888', '180px GridLED-Italic', toRaw(fontInfo));
    genBusNameView();
}, 0)

function loadColors() {
    let cs = localStorage.getItem('BusToolsFontInfo')
    if (!fontInfo)
        return
    cs = JSON.parse(cs)
    for (let fn in cs) {
        fontInfo[fn] = cs[fn]
    }
}
loadColors()

function saveFontInfo(ctosave) {
    console.log('saveFontInfo', ctosave || toRaw(fontInfo))
    localStorage.setItem('BusToolsFontInfo', JSON.stringify(ctosave || toRaw(fontInfo)))
}

function fontInfoChange(event) {
    let tgt = event && event.target
    event && console.log('fontInfoChange', tgt.id, tgt.value, typeof (tgt.value), toRaw(fontInfo))
    let alphaHex = alphaToHex(fontInfo.alpha)

    if (event && tgt.id.endsWith('Bg')) {
        console.log('forcing alpha', alphaHex, tgt.value)
        fontInfo[tgt.id] += alphaHex
    } else {
        for (let fn in toRaw(fontInfo)) {
            let color = fontInfo[fn]
            // console.log(fn, '->', color)
            if (fn.endsWith('Bg')) {
                let oc = color;
                [color,] = splitColor(color)
                fontInfo[fn] = '#' + color + alphaHex
                console.log(fn, oc, '->', fontInfo[fn])
            }
        }
    }
    event && console.log('fontInfoChange', tgt.id, tgt.value)
    saveFontInfo()
    canvas_gridLED.value && updateCanvasGeom()
    setTimeout(genBusNameView, 0);
}
fontInfoChange()

function genBusNameView() {
    if (!busName.value)
        return;
    canvas_preview.value.style.fontSize = fontInfo.fontSize + 'px'

    updateCanvasGeom()

    let fontName = 'GridLED-Italic';
    // let fontSize = '180px';
    DrawTextEx(canvas_gridLED.value, busName.value, `${fontInfo.fontSize}px ${fontName}`, toRaw(fontInfo));
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

function saveAsPic() {
    let picName = busName.value
    saveAs(canvas_gridLED.value.toDataURL(), picName + '.png')
}


</script>

<template>
    <div class="border m-3 p-3">
        <h3 class="fw-bold">生成线路名</h3>
        <form @submit.prevent="genBusNameView">
            <div class="input-group mb-3">
                <input id="bus-name" list="bus-list" class="form-control" placeholder="输入线路名" type="text"
                    v-model="busName">
                <button id="genBusNameView" class="btn btn-primary">生成</button>
                <datalist id="bus-list">
                    <option v-for="bus in busList" :key="bus">{{ bus }}</option>
                </datalist>
            </div>
        </form>
        <br>

        <div class="input-group mb-3">
            <div class="input-group mb-3">
                <label class="input-group-text me-3"
                    :style="{ color: invertColor(fontInfo.bgColor), backgroundColor: fontInfo.bgColor }"
                    for="busNameBg_tools">背景颜色</label>
                <input type="color" id="busNameBg_tools" class="form-control" hidden v-model="fontInfo.bgColor"
                    @change="fontInfoChange">

                <label class="input-group-text rounded-end fw-bold"
                    :style="{ color: fontInfo.textColor, backgroundColor: invertColor(fontInfo.textColor) }"
                    for="textColor_tools">字体颜色</label>
                <input type="color" id="textColor_tools" class="form-control" hidden v-model="fontInfo.textColor"
                    @change="fontInfoChange">

                <label class="input-group-text ms-3 rounded-start fw-bold font-monospace" for="alpha">不透明度 {{
                    fontInfo.alpha.toString().padStart(3, '&nbsp;') }}</label>
                <input type="range" id="alpha" class="form-control form-range me-3" v-model="fontInfo.alpha"
                    @change="fontInfoChange">
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text rounded-start fw-bold font-monospace" for="fontSize">字体大小 {{
                    fontInfo.fontSize.toString().padStart(3, '&nbsp;') }}px</label>
                <input type="range" id="fontSize" class="form-control form-range" min="12" max="600"
                    v-model="fontInfo.fontSize" @change="fontInfoChange">
            </div>
            <button class="btn btn-primary mx-3"
                @click="saveFontInfo(defaultFontInfo); loadColors(); fontInfoChange()">恢复默认颜色</button>

        </div>
        <div class="view">
            <div id="canvas_preview" ref="canvas_preview" :hidden="!showCanvasPreview" :style="{color: fontInfo.textColor, background: fontInfo.bgColor, width: fontInfo.fontSize*2 + 'px', height: fontInfo.fontSize*1.5 + 'px'}">{{ busName }}</div>

            <canvas ref="canvas_gridLED" id="busnameview" :style="{width: fontInfo.fontSize*2 + 'px', height: fontInfo.fontSize*1.5 + 'px'}"></canvas>
            <hr class="invisible">

            <button class="btn btn-primary float-end m-3" @click="saveAsPic">保存成图片</button>
        </div>
        <hr class="invisible">
        <hr class="invisible">
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

input[type="range"] {
    width: fit-content !important;
    height: 2.3rem !important;
}

/* input[type="checkbox"] {
    height: 2.4rem !important;
} */

@font-face {
    font-family: 'GridLED-Italic';
    /* src: url('/fonts/GridLED-Italic.otf'); */
    src: url('/fonts/GridLED-Italic.woff2');
}

#canvas_preview {
    font-family: 'GridLED-Italic';
    font-size: 150px;
    /* color: orange; */
    background: black;
    text-align: center;
}
</style>