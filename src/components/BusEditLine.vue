<script setup>
const emit = defineEmits(['updateBusList'])

import { ref } from 'vue'
import { busAddLine, busDeleteLine, busGetBusStops } from './BusStopStor.js'
import { EventBusTool } from './EventBus.js';
import { addTestData } from './BusTestData.js';

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('line-change', (bname) => { busName.value = bname; loadLine() })

const busName = ref('')
const busStopsStr = ref('')

function parseBusStopsStr(str) {
    if (!str)
        return []
    function removeDelimiter(match, ...args) {
        return match.replace(/,|，|、|～/g, '∙')
    }
    str = str.replace(/([(（])([^(（）),，、～]+[,，、～])+([^,，、～(（）)]+[）)])/g, removeDelimiter)
    console.log(str)
    let stops = str.split(/,|，|、|～/)
    let stops_tm = stops.map(s => s.trim())
    stops_tm = stops_tm.filter((v) => v != '')
    console.log('stops', stops_tm)
    return stops_tm;
}

async function loadLine() {
    let stopList = await busGetBusStops(busName.value)
    console.log('stop list', stopList)
    if (!stopList) {
        let msg = `找不到线路：${busName.value}`;
        console.log(msg)
        eventBus.publish('message', 'warn', msg)
    }
    else {
        busStopsStr.value = stopList.join(',')
    }
}


function saveLineStr(bname, bstops) {
    console.log('saveLineStr', bname, bstops)
    let stops = parseBusStopsStr(bstops)
    if (!stops.length)
        return
    busAddLine(bname, stops)
    eventBus.publish('message', 'info', '保存成功')
    emit('updateBusList')
}

function saveLine() {
    saveLineStr(busName.value, busStopsStr.value)
}

function deleteLine() {
    busDeleteLine(busName.value)
    emit('updateBusList')
    eventBus.publish('message', 'info', '删除成功')
}

setTimeout(addTestData, 0, saveLineStr)

</script>

<template>
    <h2>添加/修改线路</h2>
    <!-- <form @submit.prevent="addTodo"></form> -->
    <div>
        <form @submit.prevent="loadLine">
            <span>线路名：</span>
            <input type="text" v-model="busName">
            <button id="load">加载</button>
        </form>
        <span class="label-ex">经停站 (地铁图标🚆🚇）：</span>
        <textarea rows="6" cols="100" v-model="busStopsStr"></textarea>
        <div>
            <button class="right" id="save" @click="saveLine">添加/保存</button>
            <button class="right" id="save" @click="deleteLine">删除</button>
        </div>
    </div>
</template>

<style scoped>
div {
    padding-bottom: 1.5rem;
}

button {
    margin-left: 2rem;
}

button.right {
    float: right;
}

.label-ex {
    display: block;
}
</style>
