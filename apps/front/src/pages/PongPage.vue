<template>
  <q-page padding>
    This is pong game
  </q-page>
</template>

<script lang="ts" setup>
import io from "socket.io-client"
import { defineComponent } from "vue";
// import { PongGame } from '@polypong/game';
import { PongGame } from '@polypong/game';

const socket = io(`http://localhost:3000`)
console.log('Socket', socket)

const options = {
    traceLevel: null,
    delayInputCount: 3,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: 'extrapolate',
        remoteObjBending: 0.8,
        bendingIncrements: 6
    }
}
console.log(PongGame)
// const gameEngine = new PongGame({options});
// const clientEngine = new PongClientEngine(gameEngine, options);
</script>
