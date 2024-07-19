<script setup>
import { ref } from 'vue'
import { EventBusTool } from './EventBus.js';

const eventBus = EventBusTool.getEventBus()
eventBus.subscribe('message', showMessage)

const message = ref('')
const show = ref(false)

let levelColors = {
    error: 'red',
    warn: 'yellow',
    info: 'white',
    debug: 'gray',
}

function showMessage(level, msg) {
    message.value.innerText = msg
    message.value.style.color = levelColors[level || 'info']
    show.value = true
    setTimeout(() => show.value = false, 3000)
}
</script>

<template>
    <div id="snackbar" :class="{ show: show }"><span ref="message"></span></div>
</template>

<style>
#snackbar {
    visibility: hidden;
    min-width: 250px;
    margin-left: -125px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 2px;
    padding: 16px;
    position: fixed;
    z-index: 1;
    left: 50%;
    bottom: 30px;
    font-size: 17px;
}

#snackbar.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
}


@-webkit-keyframes fadein {
    from {
        bottom: 0;
        opacity: 0;
    }

    to {
        bottom: 30px;
        opacity: 1;
    }
}

@keyframes fadein {
    from {
        bottom: 0;
        opacity: 0;
    }

    to {
        bottom: 30px;
        opacity: 1;
    }
}

@-webkit-keyframes fadeout {
    from {
        bottom: 30px;
        opacity: 1;
    }

    to {
        bottom: 0;
        opacity: 0;
    }
}

@keyframes fadeout {
    from {
        bottom: 30px;
        opacity: 1;
    }

    to {
        bottom: 0;
        opacity: 0;
    }
}
</style>