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
    <div style="border: 2px solid green; display: flex; justify-content: center; align-items: center;">
      <PolygonMap class="map" ref="mapEl"
        :map="mapProps"
        :paddles="paddles"
        :balls="balls"
      >
      </PolygonMap>
    </div>
    <!-- :icon="isPaused ? 'unpause' : 'play'" -->
    <q-btn @click="togglePause()" :icon=" isPaused === 'true' ? 'play_arrow' : 'pause'">
      {{ isPaused === 'true' ? 'Play' : 'Pause' }}
    </q-btn>
    <q-btn dense @click="tick()">
      tick
    </q-btn>
    <q-slider label v-model="forcedRatio" :step="0" :min="0.0" :max="1.0" color="green"/>
    <q-btn dense @click="reset()">
      reset
    </q-btn>
    <!-- <pre>
      {{ tickValue }}
    </pre> -->
    <pre style="background-color: grey;">
      El : {{ usedRatio }}
      Pause : {{ isPaused }} {{ typeof(isPaused) }}
      Ball : {{ balls }}
      Paddle : {{ paddles }}
      Info : {{ info }}
    </pre>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, StyleValue, Ref, watch, computed, VueElement } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import { useApi } from 'src/utils/api';
import { Position, Paddle, Ball } from 'src/utils/game';
import { MaybeElementRef, useMouseInElement } from '@vueuse/core'
import PolygonMap from 'src/components/PolygonMap.vue';
import { Notify } from 'quasar';
const { socket } = useAuthStore();


const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const info: Ref<object> = ref();
const mapEl: Ref<InstanceType<typeof PolygonMap>> = ref();

const props = defineProps({
  lobbyId: Number,
});

const {
  data: isPaused,
  execute: togglePause,
  // afterFetch: (ctx: any) => ({ data: ctx.data === 'true', ...ctx }),
} = useApi<string>('pong/pause', { immediate: false });


const { elementX, elementWidth, isOutside } = useMouseInElement(mapEl);
const ratio = computed(() => {
  let r = elementX.value / elementWidth.value;
  if (r > 1) r = 1;
  else if (r < 0) r = 0;
  return r;
});
const forcedRatio = ref(null);

const usedRatio = computed(() => {
  const val = isOutside.value && (isPaused.value === 'true') ? forcedRatio.value : ratio.value;
  // console.log("Ratio update", val);
  return val;
});

watch(usedRatio, (val) => {
  socket?.emit('paddlePercent', val);
});

const update = (evt: any) => {
  const { balls: b, paddles: p, ...rest } = evt;
  if (b) balls.value = b;
  if (p) paddles.value = p;
  // if (rest) console.log('Updating rest is', rest);
};

onMounted(() => {
  // console.log(ball_ref.value, world.value, paddle1_ref.value, paddle2_ref.value);
  // window.addEventListener('keydown', onKeyDown);
});

const mapProps: Ref<{ verticles: number[], angles: number[] }> = ref({
  verticles: [],
  angles: [],
});
const mapChange = (res) => {
  mapProps.value = res;
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
