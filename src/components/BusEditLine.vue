<script setup>
const emit = defineEmits(['updateBusList'])

import { ref } from 'vue'
import { busAddLine, busDeleteLine, busGetBusStops, deleteAllLines } from './BusStopStor.js'
import { EventBusTool } from './EventBus.js';
import { addTestData } from './BusTestData.js';

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('line-change', (bname) => { busName.value = bname; loadLine() })

const busName = ref('')
const busStopsStr = ref('')
const confirmClear = ref('')

function parseBusStopsStr(str) {
    if (!str)
        return []
    // eslint-disable-next-line no-unused-vars
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

function deleteAll() {
    if (confirmClear.value != 'deleteall') {
        eventBus.publish('message', 'info', '请输入deleteall')
        return
    }
    confirmClear.value = ''
    deleteAllLines()
    emit('updateBusList')
    eventBus.publish('message', 'info', '清空成功')
}

// setTimeout(addTestData, 0, saveLineStr)

</script>

<template>
    <h2>添加/修改线路</h2>
    <!-- <form @submit.prevent="addTodo"></form> -->
    <div class="form-control m-2 w-100">
        <form @submit.prevent="loadLine">
            <div class="input-group mb-3">
                <input id="bus-name" class="form-control" placeholder="输入线路名" type="text" v-model="busName">
                <button id="load" class="btn btn-primary">加载线路</button>
            </div>
        </form>
        <div>
            <label class="form-control text-primary">经停站 (Tips：地铁图标🚆🚇, 使用'车站名@道路名'的方式来保存路名）</label>
            <textarea class="w-100" rows="6" v-model="busStopsStr"></textarea>
        </div>
        <div class="mb-3">
            <button class="btn btn-danger float-start m-2" id="delete" @click="deleteLine">删除线路</button>
            <button class="btn btn-primary float-end m-2" id="save" @click="saveLine">添加/保存线路</button>
            <hr class="invisible">
        </div>
    </div>
    <div class="form-control m-2">
        <button class="btn btn-primary" @click="() => addTestData(saveLineStr)">加载徐州2016年7月的公交数据</button><br>
        <hr>
        <div class="input-group mb-3">
            <label class="input-group-text" for="confirmClear">在右侧输入 deleteall 以确认删除 </label>
            <input id="confirmClear" type="text" class="form-control" v-model="confirmClear">
            <button class="delete btn btn-danger" @click="deleteAll">删除所有线路，无法恢复</button>
        </div>
    </div>
</template>

<style scoped>
.right {
    float: right;
}

.label-ex {
    display: block;
}

hr {
    width: 100%;
}

.alert {
    width: fit-content;
}
</style>
