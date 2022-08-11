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
    <FssFallback class="wrapper">
      Balls => {{ $game.getBalls }}
      <PolygonMap
        class="map"
        ref="mapEl"
        :map="$game.map"
        :paddles="$game.paddles"
        :balls="$game.balls"
        :powers="$game.powers"
        @paddleMove="updatePaddlePercent">
      </PolygonMap>
    </FssFallback>
    <!-- :icon="isPaused ? 'unpause' : 'play'" -->
    <q-btn @click="$game.pauseGame()" :icon="$game.isPaused ? 'play_arrow' : 'pause'">
      {{ $game.isPaused ? 'Play' : 'Pause' }}
    </q-btn>
    <!-- <q-btn dense @click="tick()">
      tick
    </q-btn> -->
    <!-- <q-slider label v-model="forcedRatio" :step="0" :min="0.0" :max="1.0" color="green"/> -->
    <!-- <q-btn dense @click="reset()">
      reset
    </q-btn> -->
  </q-page>
</template>
<script lang="ts">
import { Notify } from 'quasar';
import { PreFetchOptions } from '@quasar/app-vite';
import { useGameStore } from 'src/stores/game.store';

export default {
  async preFetch(ctx: PreFetchOptions<unknown>) {
    const {
      currentRoute, redirect,
    } = ctx;
    const $game = useGameStore();
    const id = currentRoute.params.id as string;
    try {
      await $game.fetchCurrentGame(id);
    } catch (err) {
      Notify.create({
        type: 'negative',
        message: 'Error while joining game',
      });
      redirect({ name: 'lobbies' });
    }
  },
};
</script>
<script lang="ts" setup>
import {
  defineProps, ref, onMounted, Ref, computed, onUnmounted,
} from 'vue';
import { useMouseInElement } from '@vueuse/core';
import { useAuthStore } from 'src/stores/auth.store';
import { useApi } from 'src/utils/api';
import { Paddle, Ball } from 'src/utils/game';
import PolygonMap from 'src/components/PolygonMap.vue';
import FssFallback from 'src/components/FssFallback.vue';
import { useRoute, useRouter } from 'vue-router';

const $route = useRoute();
const { socket } = useAuthStore();
const id = $route.params.id as string;
const $game = useGameStore();

const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const powers: Ref<any[]> = ref([]);
const mapEl: Ref<InstanceType<typeof PolygonMap>> = ref();

const props = defineProps({
  lobbyId: Number,
});

const { elementX, elementWidth, isOutside } = useMouseInElement(mapEl);
const ratio = computed(() => {
  let r = elementX.value / elementWidth.value;
  if (r > 1) r = 1;
  else if (r < 0) r = 0;
  return r;
});
const forcedRatio = ref(null);

const usedRatio = computed(() => {
  const val = isOutside.value && ($game.isPaused) ? forcedRatio.value : ratio.value;
  // console.log("Ratio update", val);
  return val;
});

const updatePaddlePercent = (percent: number) => {
  socket?.emit('paddlePercent', percent);
};
// watch(usedRatio, (val) => {
//   updatePaddlePercent((val as number));
// });

const update = (evt: any) => {
  const { balls: b, paddles: p, ...rest } = evt;
  console.log('Updating ?');
  if (b) $game.balls = b;
  if (p) $game.paddles = p;
  // if (rest) console.log('Updating rest is', rest);
};

const mapProps: Ref<{ verticles: number[], angles: number[] }> = ref({
  verticles: [],
  angles: [],
});
const mapChange = (res) => {
  mapProps.value = res;
};

const powersUpdate = (res) => {
  console.log('powers update', res);
  powers.value = res;
};

const printTimer = ({ timer }: { timer: number }) => {
  Notify.create({
    timeout: timer,
    progress: true,
    position: 'top',
    message: 'New round will start',
  });
};

// socket?.on('gameUpdate', update);
// socket?.on('mapChange', mapChange);
// socket?.on('powers', powersUpdate);
// socket?.on('timer', printTimer);

const {
  data: test,
  execute: reset,
} = useApi('pong/reset', { immediate: false });

onMounted(async () => {
  // const gameInfos: any = await lobbyApi.get('/game');
  // console.log('Game infos', gameInfos);
  // paddles.value = gameInfos.paddles;
  // mapProps.value = gameInfos.map;
  // isPaused.value = gameInfos.isPaused;
  console.log('Mounting');
  await $game.fetchCurrentGame(id);
  socket?.on('gameUpdate', ({ balls: b, paddles: p }) => {
    // $game.$patch({ balls: b, paddles: p });
    $game.balls = b;
    $game.paddles = p;
    console.log('Game up', $game.balls[0]?.position, b[0]?.position);
  });
  socket?.on('mapChange', (map) => {
    $game.map = map;
  });
  socket?.on('powers', (pow) => {
    $game.powers = pow;
  });
});
onUnmounted(() => {
  socket?.off('gameUpdate');
  socket?.off('mapChange');
  socket?.off('powers');
});

</script>
