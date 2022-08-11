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

.mouse-zone {
  height: 100%;

}
</style>
<template>
  <q-page>
    <FssFallback class="wrapper">
      <!-- Balls => {{ elementX }} % {{ percentage }} -->
      <!-- <pre>
        element X {{ elementX }}
        element -X {{ elementWidth - elementX }}
        element width {{ elementWidth }}
        wall size {{ mapProps.wallWidth }}
        TEST: {{ percentage }}
      </pre> -->
      <!-- <pre>|| {{ Object.keys(mapProps) }} {{ mapProps.wallWidth }}</pre> -->
      <div class="mouse-zone" ref="mouseZone">
        <PolygonMap
          class="map"
          ref="mapEl"
          :map="mapProps"
          :paddles="paddles"
          :balls="balls"
          :powers="powers"
          @paddleMove="updatePaddlePercent"
        >
          <!-- <q-slider :modelValue="0"></q-slider> -->
        </PolygonMap>
      </div>
    </FssFallback>
    <!-- :icon="isPaused ? 'unpause' : 'play'" -->
    <q-btn @click="$game.pauseGame()" :icon="$game.isPaused ? 'play_arrow' : 'pause'">
      {{ $game.isPaused ? 'Play' : 'Pause' }}
    </q-btn>
    <q-btn @click="$game.restart()" icon="fas fa-arrows-rotate">
      restart
    </q-btn>
    <pre>
      {{ mapProps }}
    </pre>
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
import {
  Paddle,
  Ball,
  Power,
  PolygonMap as PolyMap,
} from 'src/utils/game';
import PolygonMap from 'src/components/PolygonMap.vue';
import FssFallback from 'src/components/FssFallback.vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  lobbyId: Number,
});

const $route = useRoute();
const { socket } = useAuthStore();
const $game = useGameStore();

const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const powers: Ref<Power[]> = ref([]);
const mapEl: Ref<InstanceType<typeof PolygonMap> | null> = ref(null);
const mouseZone = ref();
const mapProps: Ref<PolyMap> = ref({
  verticles: [],
  angles: [],
  walls: [],
  inradius: 0,
});

const { elementX, elementWidth, isOutside } = useMouseInElement(mouseZone);

const percentage = computed(() => {
  const size = mapProps.value.wallWidth;
  const middle = elementWidth.value / 2;
  const right = elementWidth.value - elementX.value;
  const left = elementWidth.value;

  const x = right / left;
  return x;
});
// const ratio = computed(() => {
//   let r = elementX.value / elementWidth.value;
//   if (r > 1) r = 1;
//   else if (r < 0) r = 0;
//   return r;
// });
// const forcedRatio = ref(null);

// const usedRatio = computed(() => {
//   const val = isOutside.value && ($game.isPaused) ? forcedRatio.value : ratio.value;
//   // console.log("Ratio update", val);
//   return val;
// });

const updatePaddlePercent = (percent: number) => {
  socket?.emit('paddlePercent', percent);
};

onMounted(async () => {
  paddles.value = $game.paddles;
  mapProps.value = $game.map;
  balls.value = $game.balls;

  socket?.on('gameUpdate', ({ balls: b, paddles: p }) => {
    paddles.value = p;
    balls.value = b;
  });
  socket?.on('mapChange', (map) => {
    mapProps.value = map;
    powers.value = [];
  });
  socket?.on('powers', (pow) => {
    powers.value = pow;
  });

  socket?.once('end', (winner = { name: 'Error' }) => {
    Notify.create({
      message: `Chicken chiken dinner we have a winner ${winner.name}`,
    });
  });
});
onUnmounted(() => {
  socket?.off('gameUpdate');
  socket?.off('mapChange');
  socket?.off('powers');
});

</script>
