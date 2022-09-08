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

.max-heighted {
  max-height: calc(100vh - 50px);
}
</style>
<template>
  <q-page class="max-heighted" full-height>
    <FssFallback class="wrapper">
      <PolygonMap
        class="map"
        ref="mapEl"
        :map="mapProps"
        :paddles="paddles"
        :balls="balls"
        :powers="powers"
        :scores="scores"
        @paddleMove="updatePaddlePercent"
      >
      </PolygonMap>
    </FssFallback>

    <q-btn @click="$game.pauseGame()" :icon="$game.isPaused ? 'play_arrow' : 'pause'">
      {{ $game.isPaused ? 'Play' : 'Pause' }}
    </q-btn>
    <q-btn @click="$game.restart()" icon="fas fa-arrows-rotate">
      restart
    </q-btn>
  </q-page>
</template>
<script lang="ts">
import { Notify } from 'quasar';
import { PreFetchOptions } from '@quasar/app-vite';
import { useGameStore } from 'src/stores/game.store';
import { useRoute } from 'vue-router';

export default {
  async preFetch(ctx: PreFetchOptions<unknown>) {
    const {
      currentRoute, redirect,
    } = ctx;
    const $game = useGameStore();
    const id = currentRoute.params.id as string;
    //    console.log('in GamePage prefetch, id = ', id);
    try {
      await $game.fetchCurrentGame(id);
    } catch (err) {
      redirect({ name: 'lobbies' });
    }
  },
};
</script>
<script lang="ts" setup>
import {
  defineProps, ref, onMounted, Ref, computed, onUnmounted,
} from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import {
  Paddle,
  Ball,
  Power,
  PolygonMap as PolyMap,
  Line,
  Position,
  Score,
} from 'src/utils/game';
import PolygonMap from 'src/components/PolygonMap.vue';
import FssFallback from 'src/components/FssFallback.vue';

const props = defineProps({
  lobbyId: Number,
});
const { socket } = useAuthStore();
const $game = useGameStore();
const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const powers: Ref<Power[]> = ref([]);
const scores: Ref<Score[]> = ref([]);
const mapProps: Ref<PolyMap> = ref({
  verticles: [],
  angles: [],
  walls: [],
  inradius: 0,
  wallWidth: 0,
});

const $route = useRoute();
const id = +$route.params.id;
const updatePaddlePercent = (percent: number) => {
  socket.emit('m', percent.toFixed(2));
};

onMounted(async () => {
  paddles.value = $game.paddles;
  mapProps.value = $game.map;
  balls.value = $game.balls;
  scores.value = $game.scores;
  socket.on('gameUpdate', ({ balls: b, paddles: p }) => {
    paddles.value = p;
    balls.value = b;
  });
  socket.on('object', (index, name, item) => {
    // console.log('index ', index, ' name ', name, ' item ', item);
    switch (name) {
      case 'ball':
        balls.value[index] = item;
        break;
      case 'power':
        // console.log("power time")
        powers.value[index] = item;
        break;
      case 'removePower':
      //   powers.value[index] = item;
      //   powers.value.splice(index,1);
        break;
      case 'score':
        scores.value = item;
        break;
      case 'paddle':
        paddles.value[index] = item;
        break;
      default:
        console.log('Unknown object', item);
        break;
    }
  });
  socket.on('p', (p: Line[], b: Position[]) => {
    b.forEach((b, i) => { if (balls.value[i]) balls.value[i].position = b; });
    p.forEach((p, i) => { if (paddles.value[i]) paddles.value[i].line = p; });
  });
  socket.on('mapChange', (map) => {
    mapProps.value = map;
    powers.value = [];
  });
  socket.on('score', (s) => {
    scores.value = s;
  });
  socket.on('powers', (pow) => {
    powers.value = pow;
  });
  socket.once('end', (winner = { name: 'Error' }) => {
    Notify.create({
      message: `Chicken chiken dinner we have a winner ${winner.name}`,
    });
  });
});
onUnmounted(() => {
  socket.off('gameUpdate');
  socket.off('mapChange');
  socket.off('powers');
  socket.off('objects');
  $game.$reset();
});

</script>
