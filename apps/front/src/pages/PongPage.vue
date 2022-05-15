<template>
  <q-page padding>
    <div class="world">
        <div class="leftWall"></div>
        <div class="rightWall"></div>
        <div class="topWall"></div>
        <div class="bottomWall"></div>
        <div class="paddle1"></div>
        <div class="paddle2"></div>
        <div class="ball"></div>
        <div class="score1"></div>
        <div class="score2"></div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import io from "socket.io-client"
import { defineComponent } from "vue";
import { PongGame, PongClientEngine } from '@polypong/game';
import { Lib } from 'lance-gg';

// const socket = io(`http://localhost:3000`)
// console.log('Socket', socket)

const options = {
    traceLevel: Lib.Trace.TRACE_ALL,
    delayInputCount: 3,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: 'extrapolate',
        remoteObjBending: 0.8,
        bendingIncrements: 6
    },
    worldSettings: {
      width: 800,
      height: 900,
    },
    serverURL: 'localhost:3000',
}
console.log(PongGame)
const gameEngine = new PongGame({ options });
const clientEngine = new PongClientEngine(gameEngine, options);
clientEngine.start();
</script>
