<style lang="scss" scoped>
.paddle {
  position: absolute;
  background-color: green;
  width: 20px;
  height: 100px;
}

.ball {
  background-color: red;
  width: 20px;
  height: 20px;
  display: inline-block;
  position: absolute;
}

.map {
  position: relative;
}
</style>
<template>
  <q-page padding>
    <div style="display: flex; justify-content: center; align-items: center;">
      <PolygonMap class="map" ref="mapEl" :verticles="verticles" :paddles="paddles" :balls="balls">
        <!-- <div class="ball"
           v-for="ball in balls"
          :style="formatBallStyle(ball)">a</div>
        <div class="paddle"
          v-for="paddle in paddles"
          :style="formatPaddleStyle(paddle)"
        >b</div> -->
      </PolygonMap>
    </div>
    <!-- :icon="isPaused ? 'unpause' : 'play'" -->
    <q-btn :label="isPaused ? 'play' : 'pause'" @click="togglePause()">
    </q-btn>
    <q-btn dense @click="tick()">
      tick
    </q-btn>
    <!-- <pre>
      {{ tickValue }}
    </pre> -->
    <pre style="background-color: grey;">
      <!-- El x {{ elementX }} -->
      Ball : {{ balls }}
      Paddle : {{ paddles }}
      Info : {{ info }}
      <!-- Pause : {{ isPaused }} -->
    </pre>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, StyleValue, Ref, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import { useApi } from 'src/utils/api';
import { Position, Paddle, Ball } from 'src/utils/game';
import { useMouseInElement } from '@vueuse/core'
import PolygonMap from 'src/components/PolygonMap.vue';

const { socket } = useAuthStore();


const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const info: Ref<any> = ref(null);

const props = defineProps({
  lobbyId: Number,
});

const onKeyDown = (evt: KeyboardEvent) => {
  socket?.emit('paddleUpdate', evt.key);
}

function formatPositionStyle(position: Position) {
  const { x, y, h, w } = position;
  return {
    top: `${y}%`,
    left: `${x}%`,
    width: `${w}%`,
    height: `${h}%`,
  };
}

function formatPaddleStyle(paddle: Paddle): StyleValue {
  return {
    ...formatPositionStyle(paddle.pos),
    transform: `rotate(${paddle.angle}deg)`,
    backgroundColor: 'green',
  };
}

function formatBallStyle(ball: Ball): StyleValue {
  const style = {
    ...formatPositionStyle(ball.pos),
    backgroundColor: 'red',
  };
  return style;
}

const mapEl = ref(null);

const { elementX, elementWidth } = useMouseInElement(mapEl)
watch(elementX, (x: number) => {
  // console.log("sending")
  let ratio = x / elementWidth.value;
  if (ratio > 1) ratio = 1;
  else if (ratio < 0) ratio = 0;
  socket?.emit('paddlePercent', ratio);
})

const update = (evt: any) => {
  const { balls: b, paddles: p, ...rest } = evt;
  // console.log('Event', evt);
  balls.value = [...b];
  // console.log("Paddles", evt.paddles);
  paddles.value = [...p];
  info.value = rest;
}

onMounted(() => {
  // console.log(ball_ref.value, world.value, paddle1_ref.value, paddle2_ref.value);
  // window.addEventListener('keydown', onKeyDown);
});

const verticles = ref([]);
const mapChange = (res) => {
  console.log("Change map", res);
  verticles.value = res.edges;
  console.log("new verticles", verticles.value)
};

socket?.on('gameUpdate', update);
socket?.on('mapChange', mapChange);

const {
  data: isPaused,
  execute: togglePause,
} = useApi('pong/pause', { immediate: false });

const {
  data: tickValue,
  execute: tick,
} = useApi('pong/tick', { immediate: false }).json();

</script>
