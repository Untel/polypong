<style lang="scss" scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: inherit;
  svg {
    margin: 20px;
    width: auto;
    padding: 20px;

    polygon {
      fill: rgba(255, 255, 255, .3);
      // stroke: black;
    }

    .paddle {

    }

    .ball {
      box-shadow: inset 0 0 0 6px #e78267;
    }

    .wall {
      stroke: rgba(46, 164, 38, 0.7);

      &.mine {
        fill: rgba(24, 32, 145, 0.9);
        stroke: rgba(24, 32, 145, 0.9);
      }
    }
  }
}
</style>

<template>
  <div class="svg-test wrapper">
    <svg
      viewBox="-50 -50 100 100"
      ref="svgRef"
    >
      <polygon ref="polygonRef" />
      <circle
        fill="#ff00001a"
        :r="map.inradius"
        :x="0" :y="0"
      />
      <!-- <line
        v-for="(wall, idx) in map.walls || []"
        :key="`wall-${idx}`"
        ref="wallsRef"
        class="wall"
        stroke-width=".1px"
        v-bind="formatLine(wall.line)"
      /> -->
      <line
        v-if="myWall"
        ref="myWallRef"
        class="wall"
        stroke-width="1px"
        v-bind="formatLine(myWall.line)"
      />
      <line
        class="paddle"
        v-for="(paddle, idx) in paddles"
        :key="`paddle-${idx}`"
        :stroke="paddle.color || 'red'"
        stroke-width="2px"
        v-bind="formatLine(paddle.line)"
      />
      <g v-for="(ball, idx) in balls"
        :key="`ball-${idx}`"
        >
        <circle
          class="ball"
          :fill="ball.color || 'yellow'" r="2"
          v-bind="formatCirclePosition(ball.position)"
        />
        <line
          :stroke="ball.color || 'red'"
          stroke-width="0.25px"
          stroke-dasharray="2"
          v-bind="formatBallTrajectoryPoints(ball)"
        />
        <circle
          v-if="ball.target"
          :fill="ball.color || 'yellow'" r=".5"
          v-bind="formatCirclePosition(ball.target.hit)"
        />
      </g>
      <circle
        v-for="(power, idx) in powers"
        :key="`power-${idx}`"
        stroke="yellow" r="2"
        v-bind="formatCirclePosition(power.position)"
      />
    </svg>
    <slot />
    <pre>
      Ratio: {{ ratio }}
      Gamma: {{ gammaRatio }} - {{ gamma }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import {
  computed, PropType, watch, ref, onMounted,
} from 'vue';
import {
  Position,
  Paddle,
  Ball,
  Power,
  Line,
  PolygonMap,
} from 'src/utils/game';
import anime from 'animejs/lib/anime.es.js';
import { useMouseInElement, useDeviceOrientation, watchDebounced } from '@vueuse/core';
import { useAuthStore } from 'src/stores/auth.store';

const props = defineProps({
  map: {
    type: Object as PropType<PolygonMap>,
    default: () => ({
      verticles: [],
      angles: [],
      walls: [],
      inradius: 50,
    }),
  },
  paddles: {
    type: Array as PropType<Array<Paddle>>,
    default: () => [],
  },
  balls: {
    type: Array as PropType<Array<Ball>>,
    default: () => [],
  },
  powers: {
    type: Array as PropType<Array<Power>>,
    default: () => [],
  },
});
const emit = defineEmits(['paddleMove']);

const scaleRatio = computed(() => {
  const x = 1;
  return x;
});
function formatBallTrajectoryPoints(ball: Ball) {
  return {
    x1: ball.position.x,
    x2: ball.target.hit.x,
    y1: ball.position.y,
    y2: ball.target.hit.y,
  };
}

function formatLine(line: Line) {
  return {
    x1: line[0][0],
    x2: line[1][0],
    y1: line[0][1],
    y2: line[1][1],
  };
}

function formatCirclePosition(position: Position) {
  // console.log("Receive circle pos", position);
  return {
    cx: position.x,
    cy: position.y,
  };
}

const polygonRef = ref<HTMLElement>();
const svgRef = ref<SVGSVGElement>();

const $auth = useAuthStore();
const myWallIdx = computed(() => {
  const idx = props.map.walls.findIndex((w) => w.player?.user.id === $auth.user.id);
  return idx;
});
const myWall = computed(() => props.map.walls[myWallIdx.value]);
const myWallRef = ref<HTMLElement | null>();

const { elementX, elementWidth, isOutside } = useMouseInElement(myWallRef);
const { gamma } = useDeviceOrientation();
const ratio = computed(() => {
  const r = elementX.value / elementWidth.value;
  return 1 - (r < 0 ? 0 : r > 1 ? 1 : r);
});

const gammaRatio = computed(() => {
  if (gamma.value === null) return 0;
  const r = (gamma.value - 10) / 50;
  return 1 - (r < 0 ? 0 : r > 1 ? 1 : r);
});
watchDebounced(
  ratio,
  (val) => { emit('paddleMove', val); },
  { debounce: 10, maxWait: 30 },
);
watchDebounced(
  gammaRatio,
  (val) => { emit('paddleMove', val); },
  { debounce: 10, maxWait: 30 },
);

watch(() => props.map, (map, oldMap) => {
  const { verticles, angles, walls } = map;
  (anime.timeline as any)({
    targets: polygonRef.value,
    easing: 'easeInOutExpo',
    points: verticles.join(' '),
  })
    .add({
      targets: svgRef.value,
      keyframes: [
        { rotate: 0 },
        { rotate: 360 - angles[myWallIdx.value] + 180 },
      ],
    });
}, { immediate: true });

onMounted(() => {
  console.log('to');
});

</script>
