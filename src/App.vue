<script setup>
import { ref } from 'vue'
import ScreenRes from './components/ScreenRes.vue'
import BusEditLine from './components/BusEditLine.vue'
import BusStopView from './components/BusStopView.vue'
import MessageView from './components/MessageView.vue'

const busstopview = ref(null)

function cbupdateBusList() {
  busstopview.value.updateBusList()
}
</script>

<template>
  <main>
    <img class="logo" src="./assets/logo.png">
    <span class="title">Bus Stop View</span>
    <!-- <div class="op">
      <ScreenRes></ScreenRes>
    </div> -->
    <div class="op">
      <BusEditLine @update-bus-list="cbupdateBusList"></BusEditLine>
    </div>

    <div class="op busstopview">
      <BusStopView ref="busstopview"></BusStopView>
    </div>
    <MessageView></MessageView>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
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
  width: fit-content;
}

.busstopview {
  margin-top: 2rem;
}
</style>
