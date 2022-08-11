<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;

  svg {
    margin: 20px;
    height: 70%;
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
      fill: rgba(46, 164, 38, 0.9);
      stroke: rgba(46, 164, 38, 0.9);

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
      <polygon ref="polygonRef">
      </polygon>
      <circle
        fill="#ff00001a"
        :r="map.inradius"
        :x="0" :y="0"
      />
      <line
        v-for="(wall, idx) in map.walls || []"
        :key="`wall-${idx}`"
        :class="{ 'mine': idx === 0 }"
        ref="wallsRef"
        class="wall"
        stroke-width=".1px"
        v-bind="formatLine(wall.line)"
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

    <!-- <pre v-if="balls && balls[0]">
      {{ balls[0].pos }}
    </pre> -->
    <!-- <q-btn @click="test">test</q-btn> -->
  </div>
</template>

<script setup lang="ts">
import {
  onMounted, computed, PropType, watch, ref,
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
import { MaybeElementRef, useMouseInElement } from '@vueuse/core';

const props = defineProps({
  map: {
    type: Object as PropType<PolygonMap>,
    default: () => ({
      verticles: [],
      angles: [],
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
const svgRef = ref<HTMLElement>();
const wallsRef = ref<HTMLElement[]>();
const myWallRef = ref<HTMLElement | null>();

const myWall: MaybeElementRef = computed(() => {
  const m = wallsRef.value?.at(0);
  // console.log('M is', m);
  return m;
});

const { elementX, elementWidth, isOutside } = useMouseInElement(myWall);
const ratio = computed(() => {
  let r = elementX.value / elementWidth.value;
  if (r > 1) r = 1;
  else if (r < 0) r = 0;
  return 1 - r;
});
watch(ratio, (val) => {
  emit('paddleMove', val);
});

watch(() => props.map, (map, oldMap) => {
  const { verticles, angles } = map;
  myWallRef.value = wallsRef.value?.at(0);
  (anime.timeline as any)({
    targets: polygonRef.value,
    easing: 'easeInOutExpo',
    points: verticles.join(' '),
  })
    .add({
      targets: svgRef.value,
      keyframes: [
        { rotate: 0 },
        { rotate: 360 - angles[0] + 180 },
      ],
    });
}, { immediate: false });

onMounted(() => {
  console.log('Mounted polygon');
});
</script>
