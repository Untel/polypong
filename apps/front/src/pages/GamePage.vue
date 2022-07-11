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

.wrapper {
  min-height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<template>
  <q-page>
    <!-- LE JEU -->
    <FssFallback class="wrapper">
      <PolygonMap class="map" ref="mapEl"
        :map="mapProps"
        :paddles="paddles"
        :balls="balls"
        :powers="powers"
        @paddleMove="updatePaddlePercent"
      >
      </PolygonMap>
    </FssFallback>
    <q-btn @click="togglePause()" :icon=" isPaused === 'true' ? 'play_arrow' : 'pause'">
      {{ isPaused === 'true' ? 'Play' : 'Pause' }}
    </q-btn>
    <q-btn dense @click="tick()">
      tick
    </q-btn>
    <q-btn dense @click="reset()">
      reset
    </q-btn>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, StyleValue, Ref, watch, computed, VueElement } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import { useApi } from 'src/utils/api';
import { Position, Paddle, Ball } from 'src/utils/game';
import { MaybeElementRef, useMouseInElement } from '@vueuse/core'
import PolygonMap from 'src/components/PolygonMap.vue';
import FssFallback from 'src/components/FssFallback.vue';
import { Notify } from 'quasar';
import * as PIXI from 'pixi.js';

let app = new PIXI.Application({ width: 600, height: 600 });
document.body.appendChild(app.view);
let sprite = PIXI.Sprite.from('src/assets/federation_background.jpg');
app.stage.addChild(sprite);

const { socket } = useAuthStore();

const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const powers: Ref<any[]> = ref([]);
const info: Ref<object> = ref();
const mapEl: Ref<InstanceType<typeof PolygonMap>> = ref();

const props = defineProps({
  lobbyId: Number,
});

const {
  data: isPaused,
  execute: togglePause,
} = useApi<string>('pong/pause', { immediate: false });

const updatePaddlePercent = (percent: number) => {
  socket?.emit('paddlePercent', percent);
};

const update = (evt: any) => {
  const { balls: b, paddles: p, ...rest } = evt;
  if (b) balls.value = b;
  if (p) paddles.value = p;
};

const mapProps: Ref<{ verticles: number[], angles: number[] }> = ref({
  verticles: [],
  angles: [],
});
const mapChange = (res) => {
  // change map
  mapProps.value = res;
};

const powersUpdate = (res) => {
  // add mes powers
  powers.value = res;
};

const printTimer = ({ timer }: {timer: number}) => {
  Notify.create({
    timeout: timer,
    progress: true,
    position: 'top',
    message: `New round will start`,
  });
};

socket?.on('gameUpdate', update);
socket?.on('mapChange', mapChange);
socket?.on('powers', powersUpdate);
socket?.on('timer', printTimer);

const {
  data: tickValue,
  execute: tick,
} = useApi('pong/tick', { immediate: false }).json();

const {
  data: test,
  execute: reset,
} = useApi('pong/reset', { immediate: false });
</script>
