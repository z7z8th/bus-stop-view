<script setup>
const emit = defineEmits(['updateBusList'])

import { ref } from 'vue'
import { dbGetBusList, dbAddBusLine, dbDeleteBusLine, dbGetBusStops, dbGetBusInfo, dbDeleteAllBusLines } from './BusStopStor.js'
import { EventBusTool } from './EventBus.js';
import { addBusTestData } from './BusTestData.js';
import { saveAs } from './file.js'

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('line-change', (bname) => { busName.value = bname; loadBusStopList() })

const busList = ref([])
const busName = ref('')
const busStopListStr = ref('')
const confirmClear = ref('')
const busInfo = ref({})

async function updateBusList() {
    let blist = await dbGetBusList()
    console.log('updateBusList type', typeof blist)
    busList.value = blist
}
updateBusList()

async function triggerUpdateBusList() {
    emit('updateBusList')
    updateBusList()
}

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
    stops_tm = stops_tm.filter((v, idx) => {
        if (v == '')
            return false
        if (idx > 0)
            return stops_tm[idx - 1] != v
        return true
    })
    console.log('stops', stops_tm)
    return stops_tm;
}

async function loadBusStopList() {
    let stopList = await dbGetBusStops(busName.value)
    console.log('stop list', stopList)
    if (!stopList) {
        busStopListStr.value = ''
        let msg = `找不到线路：${busName.value}`;
        console.log(msg)
        eventBus.publish('message', 'warn', msg)
    } else {
        busStopListStr.value = stopList.join(',')
        triggerUpdateBusList()
        busInfo.value = await dbGetBusInfo(busName.value)
        console.log('busInfo', busInfo)
    }
}

function loadLine() {
    eventBus.publish('line-change', busName.value)
}

function saveLineStr(bname, bstops) {
    console.log('saveLineStr', bname, bstops)
    let stops = parseBusStopsStr(bstops)
    if (!stops.length)
        return
    dbAddBusLine(bname, stops)
    eventBus.publish('message', 'info', '保存成功')
    triggerUpdateBusList()
}

function saveLine() {
    saveLineStr(busName.value, busStopListStr.value)
}

function deleteLine() {
    dbDeleteBusLine(busName.value)
    triggerUpdateBusList()
    eventBus.publish('message', 'info', '删除成功')
}

function deleteAll() {
    if (confirmClear.value != 'deleteall') {
        eventBus.publish('message', 'info', '请输入deleteall')
        return
    }
    confirmClear.value = ''
    dbDeleteAllBusLines()
    triggerUpdateBusList()
    eventBus.publish('message', 'info', '清空成功')
}

async function loadLineFromFile(triggerSel) {
    let input = document.getElementById('inputFile')
    if (triggerSel === true) {
        input.click()
        return
    }

    let file = input.files[0]
    let content = await file.text()
    let obj = JSON.parse(content)
    for (let bname in obj) {
        dbAddBusLine(bname, obj[bname].stops, obj[bname].info)
    }
    eventBus.publish('message', 'info', '保存成功')
    triggerUpdateBusList()
}

async function saveLineToFile(savealllines) {
    if (savealllines) {
        let blist = await dbGetBusList()
        let obj = {}
        for (let bname of blist) {
            obj[bname] = {
                stops: await dbGetBusStops(bname),
                info: await dbGetBusInfo(bname),
            }
        }
        saveAs(JSON.stringify(obj), '全部公交线路数据.json')
    } else {
        if (!busName.value) {
            eventBus.publish('message', 'warning', '未选中线路')
            return
        }
        let obj = {}
        let bname = busName.value
        obj[bname] = {
            stops: await dbGetBusStops(bname),
            info: await dbGetBusInfo(bname),
        }
        saveAs(JSON.stringify(obj), `${busName.value}路公交线路数据.json`)
    }
}
</script>

<template>
    <!-- <h2>添加/修改线路</h2> -->
    <!-- <form @submit.prevent="addTodo"></form> -->
    <div class="form-control m-2 w-100">
        <form @submit.prevent="loadLine">
            <div class="input-group mb-3">
                <input id="bus-name" list="bus-list" class="form-control" placeholder="输入线路名" type="text"
                    v-model="busName">
                <button id="load" class="btn btn-primary">加载线路</button>
                <datalist id="bus-list">
                    <option v-for="bus in busList" :key="bus">{{ bus }}</option>
                </datalist>
            </div>
        </form>
        <div>
            <table class="table">
                <tbody>
                    <tr v-for="(value, key, ) in busInfo" :key="key">
                        <td>{{ key }}</td>
                        <td>{{ value }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <label class="form-control text-primary">经停站 (Tips：地铁图标🚆🚇, 使用'车站名@道路名'的方式来保存路名）</label>
            <textarea class="w-100" rows="6" v-model="busStopListStr"></textarea>
        </div>
        <div class="">
            <button class="btn btn-danger m-2" id="delete" @click="deleteLine">删除线路</button>
            <button class="btn btn-primary float-end m-2" id="save" @click="saveLine">添加/保存线路</button>
            <!-- <hr class="invisible"> -->
        </div>
    </div>
    <div class="form-control m-2">
        <div class="input-group mb-3">
            <input type="file" class="form-control" id="inputFile" hidden @change="loadLineFromFile">
            <button class="btn btn-primary rounded-start me-3" for="inputFile"
                @click="() => loadLineFromFile(true)">从文件加载线路</button>
            <!-- </div>
        <div class="input-group mb-3"> -->
            <button class="btn btn-primary me-3" for="outputFileAllBuses" @click="() => saveLineToFile(true)">
                💾 保存<span class="fw-bold">所有</span>线路到文件</button>
            <button class="btn btn-primary me-3" for="outputFileCurrentBus" @click="() => saveLineToFile(false)">
                💾 保存<span class="fw-bold">当前</span>线路到文件</button>
        </div>

    </div>
    <div class=" form-control m-2">
        <button class="btn btn-primary"
            @click="() => addBusTestData(saveLineStr)">加载徐州2016年7月的公交数据（已有线路会被覆盖）</button><br>
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
