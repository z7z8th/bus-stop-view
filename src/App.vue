<script setup>
import { ref } from 'vue'
// import ScreenRes from './components/ScreenRes.vue'
import BusEditLine from './components/BusEditLine.vue'
import BusStopView from './components/BusStopView.vue'
import MessageView from './components/MessageView.vue'
import BusDataCrawler from './components/BusDataCrawler.vue';
import BusTools from './components/BusTools.vue'

const busstopview = ref(null)
const bustools = ref(null)
const showCrawler = ref(false)

function cbupdateBusList() {
  busstopview.value.updateBusList()
  bustools.value.updateBusList()
}

function checkParams() {
  let params = new URLSearchParams(location.search)
  if (params.has('crawler')) {
    showCrawler.value = true
  }
}
checkParams()
</script>

<template>
  <main>
    <header>
      <img class="logo" src="./assets/logo.png">
      <span class="title">Bus Stop View</span>
    </header>
    <!-- <div class="op">
      <ScreenRes></ScreenRes>
    </div> -->
    <div class="d-flex align-items-start mt-3">
      <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        <button class="nav-link text-nowrap active" id="v-pills-edit-tab" data-bs-toggle="pill"
          data-bs-target="#v-pills-edit" type="button" role="tab" aria-controls="v-pills-edit"
          aria-selected="true">添加/修改线路</button>

        <button class="nav-link text-nowrap" id="v-pills-view-tab" data-bs-toggle="pill" data-bs-target="#v-pills-view"
          type="button" role="tab" aria-controls="v-pills-view" aria-selected="false">生成线路图</button>

        <button class="nav-link text-nowrap" id="v-pills-crawler-tab" :hidden="!showCrawler" data-bs-toggle="pill"
          data-bs-target="#v-pills-crawler" type="button" role="tab" aria-controls="v-pills-crawler"
          aria-selected="false">在线数据抓取</button>

        <button class="nav-link text-nowrap" id="v-pills-tools-tab" data-bs-toggle="pill"
          data-bs-target="#v-pills-tools" type="button" role="tab" aria-controls="v-pills-tools"
          aria-selected="false">小工具</button>

      </div>

      <div class="tab-content" id="v-pills-tabContent">
        <div class="tab-pane fade show active" id="v-pills-edit" role="tabpanel" aria-labelledby="v-pills-edit-tab">
          <BusEditLine @update-bus-list="cbupdateBusList"></BusEditLine>
        </div>

        <div class="tab-pane fade" id="v-pills-view" role="tabpanel" aria-labelledby="v-pills-view-tab">
          <BusStopView ref="busstopview"></BusStopView>
        </div>

        <div class="tab-pane fade" id="v-pills-crawler" :hidden="!showCrawler" role="tabpanel"
          aria-labelledby="v-pills-crawler-tab">
          <BusDataCrawler></BusDataCrawler>
        </div>

        <div class="tab-pane fade" id="v-pills-tools" role="tabpanel" aria-labelledby="v-pills-tools-tab">
          <BusTools ref="bustools"></BusTools>
        </div>
      </div>
    </div>
    <!-- <div class="op">
      <BusEditLine @update-bus-list="cbupdateBusList"></BusEditLine>
    </div>

    <div class="op busstopview">
      <BusStopView ref="busstopview"></BusStopView>
    </div>
     -->
    <MessageView></MessageView>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  width: 100%;
}

.logo {
  width: 3rem;
}

.title {
  font-size: xx-large;
}

.op {
  float: top;
  border: 1px solid gray;
  padding: 1rem;
  width: 100%;
}

.busstopview {
  margin-top: 2rem;
}
</style>
