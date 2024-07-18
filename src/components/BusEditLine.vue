<script setup>
const emit = defineEmits(['updateBusList'])

import { ref } from 'vue'
import { busAddLine, busDeleteLine } from './BusStopStor.js'

const busName = ref('')
const busStopsStr = ref('')

function parseBusStopsStr(str) {
    if (!str)
        return []
    let stops = str.split(/,|，|、|～/)
    let stops_tm = stops.map(s => s.trim())
    console.log('stops', stops_tm)
    return stops_tm;
}


function saveLineStr(bname, bstops) {
    console.log('saveLineStr', bname, bstops)
    let stops = parseBusStopsStr(bstops)
    if (!stops.length)
        return
    busAddLine(bname, stops)
    emit('updateBusList')
}

function saveLine() {
    saveLineStr(busName.value, busStopsStr.value)
}
function deleteLine() {
    busDeleteLine(busName.value)
    emit('updateBusList')
}

setTimeout(() => {
    let testData = {
        '36': '建筑学院～铜山中学、翟山市场、翟山、矿业大学、矿大北门、科技城、奎园铁路小区、奎园小区、奎园西门、奎园北门、汉桥、徐医附三院、上海路局徐州办事处、天桥、徐州站（蓝天）、徐州站（朝阳）、四道街、新建北村、二环北路、王场新村东门、钟山机动车检测中心、八里屯、淮东家具城、华隆家具城、八里建材家具',
        '快63': '铜山新区总站～久隆凤凰城北门、保利迎宾馆、久隆凤凰城西门、凤凰花园、周窝、桥上、加州玫瑰园、国基城邦、科教集聚区、矿大南湖校区东门、张伯英艺术馆、茶棚、金山村、金山公园、云龙山索道、滨湖公园东门、云龙山、中医院、中山饭店、彭城饭店（银座）、中央百大（单）',
        '34': '杏山子公交首末站，开元四季，开元路环岛，开元路东口，三环南路（开元路），杏山花园，湖西路（三环南路），南湖花园（湖西路），水上运动中心，开元名都，工人疗养院，滨湖花园，湖滨市场，金府家园，纺南小区，湖滨路口(二环西路)，建国路西口，大福源超市，永安小区，永安广场，市二院西门，夹河街西口，第一中学，夹河街东口，北路口，后勤学院，鼓楼区政府，马场村（祥和路），祥和小区，祥和路东，王场新村北门，王场新村，钟山机动车检测中心，八里屯，淮东家具城，华隆家具城，红星家具城',
        '80': '铜山公交首末站、徐州站（蓝天）、天桥东、王杰部队、九七医院（瑞康口腔医院）、小坝山、城建家园、东方人民医院、徐州医科大学、城东大道（云苑路）、宗申产业园、淮海环球港（君廷湖畔）、经开区人民法院、城东大道（振兴大道）、徐州东站北、欧蓓莎，大黄山工人村、大大路（徐海路）、大庙中心中学、滨河新天地、大庙医院、李井、河套村委会、魏集、下马、姥庙、邓庄、吴楼、野窑、上毛庄、毛庄美景佳苑、毛庄卫生院、毛庄安乐路口、李楼、贺楼、薛湖、重卜、耿集、齐集、詹湖、单集医院、单集',
        '208': '金龙湖公交首末站，金龙湖广场，科技大厦南门，美的城，金龙湖地铁站，站南路西，站南路东，徐州东站（西广场），大湖安置小区，和平东路小学，晶波光电，徐工徐挖，正崴集团，徐工矿业，侯集村委会，大庙医院，滨河新天地，大庙派出所，崇德路北，崇德路南，大庙公交首末站',
        '801': '铜山新区总站、嵩山路、万和佳苑、铜山区政府（长江西路）、科技创业大厦、康乐园、铜山中医院、新区国税局、新区邮电局、师范学院（实验小学）、江苏师范大学、建筑学院（上海路口）、铜山中学、欣欣家园、农广校、恒大滨河绿洲花园、翡翠城南、云龙区事故处理中心、徐州中专、欣欣路 (单）、两山口（单）、彭祖大道、淮海国际汽车城、惠民公园、楚韵路、惠民小区北、潘塘立交桥、孙店、花木大世界、潘塘、坦克路、韩楼村、方特乐园、张集老街、张集医院、维维产业园、贺楼、大沟里、尚王村、房村工业园、房村西、房村',
        // '': '',
    }
    for (let bname of Object.keys(testData)) {
        saveLineStr(bname, testData[bname])
    }
}, 0)

</script>

<template>
    <h2>添加/修改线路</h2>
    <!-- <form @submit.prevent="addTodo"></form> -->
    <div>
        线路名：<input type="text" v-model="busName"><br>
        经停站：<textarea rows="6" cols="100" v-model="busStopsStr"></textarea>
        <div>
            <button id="save" @click="saveLine">保存</button>
            <button id="save" @click="deleteLine">删除</button>
        </div>
    </div>
</template>

<style scoped>
div {
    padding-bottom: 1.5rem;
}

button {
    float: right;
    margin-left: 2rem;
}
</style>