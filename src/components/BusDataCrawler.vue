<script setup>
import { ref } from 'vue'
import { saveAs } from './file';

// need to use cors proxy in vite to bypass browser cors limitation
// original url: http://xuzhou.bus.iecity.com/busline.html
const START_URL = '/busline.html'
const startUrl = ref('')
const currentUrl = ref(localStorage.getItem('currentUrl') || START_URL);
const currentPage = ref();
const busListCP = ref([])
const busName = ref('')
const busStopList = ref([])
const status = ref('')
const pageLimitNo = ref(10)
let busList = {}

async function sleep(d) {
    console.log('sleep', d * 1000)
    await new Promise((resolve, reject) => {
        setTimeout(resolve, d * 1000)
    })
}

async function resetCrawler() {
    startUrl.value = ''
    currentUrl.value = START_URL
    currentPage.value = ''
    busListCP.value = []
    busName.value = ''
    busStopList.value = []
    status.value = ''
    pageLimitNo.value = 2
    busList = {}
    localStorage.setItem('currentUrl', START_URL)
}

// https://javascript.info/fetch-crossorigin
async function fetchParseBusList(url) {
    console.log('fetching', url)

    let resp = await fetch(url, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    })
    if (resp.status >= 300) {
        status.value = `failed to fetch/parse ${url}, status ${resp.status}`
        return []
    }

    let text = await resp.bytes()
    let gbk = new TextDecoder('gbk')
    text = gbk.decode(text)

    console.log('url', url, 'resp', text)
    let page = (new DOMParser()).parseFromString(text, 'text/html')
    let busLinks = page.querySelectorAll('#BusList > li a')
    console.log('busLinks', busLinks)
    let busLinkList = {}
    for (let bLink of busLinks) {
        busLinkList[bLink.innerText] = bLink.href
    }
    console.log('busLinkList', busLinkList)

    let nextElem = page.querySelector('.Pager a[rel="next"]')
    return [busLinkList, nextElem && nextElem.href]
}

async function fetchParseBusStops(url) {
    console.log('fetching', url)

    let resp = await fetch(url, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    })
    if (resp.status >= 300) {
        status.value = `failed to fetch/parse ${url}, status ${resp.status}`
        return
    }
    let text = await resp.bytes()
    let gbk = new TextDecoder('gbk')
    text = gbk.decode(text)

    console.log('url', url, 'resp')
    let page = (new DOMParser()).parseFromString(text, 'text/html')
    let bnamedirElems = page.querySelectorAll('#bus > dt')
    console.log('bnamedirElems', bnamedirElems)
    let buses = {}
    for (let bndElem of bnamedirElems) {
        console.log('bndElem', bndElem)
        let bname = bndElem.innerText
        let infoElem = bndElem.nextElementSibling.querySelectorAll('.businfo ul li')
        let info = {}
        for (let e of infoElem) {
            info[e.children[0].innerText] = e.children[1].innerText
        }
        console.log('info', info)
        let stopElems = bndElem.nextElementSibling.querySelectorAll('.busstop li > a')
        let stops = []
        for (let e of stopElems) {
            if (e.innerText != '沿途车站')
                stops.push(e.innerText)
        }
        buses[bname] = {
            stops: stops,
            info: info,
        }
        console.log('bus', bname, buses[bname])
    }
    console.log('buses', buses)
    return buses
}

function parsePageFromUrl(url) {
    let m = url.match(/--(\d+).html$/)
    return m && m[1] || '1'
}

async function startCrawler() {
    status.value = '抓取中。。。'
    let url = startUrl.value || localStorage.getItem('currentUrl') || currentUrl.value
    // let url = location.origin + startUrl.value
    let n = pageLimitNo.value
    do {
        localStorage.setItem('currentUrl', url)
        currentUrl.value = url
        currentPage.value = parsePageFromUrl(url)
        let [busLinkList, nextUrl] = await fetchParseBusList(url)
        if (!busLinkList)
            return
        busListCP.value = Object.keys(busLinkList)
        console.log('nextUrl', nextUrl)
        for (let bname in busLinkList) {
            await sleep(0.4)
            busName.value = bname

            let buses = await fetchParseBusStops(busLinkList[bname])
            if (!buses) {
                return
            }
            busStopList.value = buses
            for (let bnamedir in buses) {
                let details = buses[bnamedir]
                busList[bnamedir] = { stops: details.stops, info: details.info }
            }
            // break;
        }
        console.log('busList', busList)
        url = nextUrl
        if (url)
            localStorage.setItem('currentUrl', url)

        if (--n == 0)
            break

        await sleep(3)
    } while (url);
    console.log('=============== crawling down')
    status.value = '抓取完成'
}

function saveCrawledData() {
    saveAs(JSON.stringify(busList), 'xuzhou.bus.iecity.com上抓取的线路数据.json')
}

</script>

<template>
    <div>
        <div class="mb-3">
            <button class="btn btn-primary me-3" @click="resetCrawler">重置状态</button>
            <button class="btn btn-primary me-3" @click="startCrawler">开始抓取</button>
            <button class="btn btn-primary me-3" @click="saveCrawledData">保存抓取的数据</button>
        </div>

        <div class="input-group mb-3">
            <label class="input-group-text">从</label>
            <input type="text" v-model="startUrl" placeholder="/busline-----10.html">
            <label class="input-group-text">开始抓取</label>
            <input type="text" size="5" v-model="pageLimitNo">
            <label class="input-group-text">页</label>
        </div>
    </div>
    <table class="table">
        <thead>
            <tr scope="row" class="text-center">
                <th colspan="2" class="fw-bold">抓取状态</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td scope="row">链接</td>
                <td>{{ currentUrl }}</td>
            </tr>
            <tr>
                <td>页</td>
                <td>{{ currentPage }}</td>
            </tr>
            <tr>
                <td>线路列表</td>
                <td>{{ busListCP }}</td>
            </tr>
            <tr>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td>当前线路</td>
                <td> {{ busName }} </td>
            </tr>
            <tr>
                <td>线路站点</td>
                <td> {{ busStopList }} </td>
            </tr>
            <tr>
                <td>状态</td>
                <td> {{ status }} </td>
            </tr>
        </tbody>
    </table>

</template>

<style>
td:nth-child(2n+1) {
    text-align: right !important;
    text-wrap: nowrap;
}
</style>