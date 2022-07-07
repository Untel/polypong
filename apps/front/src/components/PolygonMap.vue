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

      // .ball {
      //   fill: rgba(81, 5, 5, 0.9);
      // }

    .paddle {
      // transform-origin: -5px -5px;
      // transform: translate3d(10px);
      // stroke: red;
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
      <!-- <defs>
        <clipPath id="clip">
          <use xlink:href="#ld"/>
        </clipPath>
      </defs>
      <use xlink:href="#ld" stroke="#0081C6" stroke-width="160" fill="#00D2B8" clip-path="url(#clip)"/> -->

      <polygon ref="polygonRef">
      </polygon>

      <line
        v-for="(wall, idx) in map.walls || []"
        :class="{ 'mine': idx === 0 }"
        ref="wallsRef"
        class="wall"
        stroke-width=".1px"
        v-bind="formatLine(wall.line)"
      />
      <line
        class="paddle"
        v-for="paddle in paddles"
        :fill="paddle.color || 'red'"
        stroke-width="2px"
        v-bind="formatLine(paddle.line)"
      />
      <circle :fill="ball.color || 'yellow'" r="2"
        v-for="ball in balls"
        v-bind="formatCirclePosition(ball.position)"
      />
      <circle :fill="ball.color || 'yellow'" r=".5"
        v-for="ball in balls.filter((b: any) => b.target?.hit)"
        v-bind="formatCirclePosition(ball.target.hit)"
      />
      <circle stroke="yellow" r="2"
        v-for="power in powers"
        v-bind="formatCirclePosition(power.position)"
      />
      <line
        :stroke="ball.color || 'red'"
        stroke-width="0.25px"
        stroke-dasharray="2"
        v-for="ball in balls"
        v-bind="formatBallTrajectoryPoints(ball)"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, PropType, StyleValue, watch, ref } from 'vue';
import { Position, Paddle, Ball } from 'src/utils/game';
import anime from 'animejs/lib/anime.es.js';
import { MaybeElementRef, useMouseInElement } from '@vueuse/core';

const props = defineProps({
  map: {
    type: Object as PropType<{ verticles: number[], angles: number[] }>,
    default: () => ({
      verticles: [],
      angles: [],
    }),
  },
  paddles: {
    type: Array as any,
    default: () => [],
  },
  balls: {
    type: Array as any,
    default: () => [],
  },
  powers: {
    type: Array as any,
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

function formatLine(line) {
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
  console.log("Changed");
  return 1 - r;
});
watch(ratio, (val) => {
  console.log("Emit");
  emit('paddleMove', val);
});

watch(() => props.map, (map, oldMap) => {
  const { verticles, angles } = map;

  myWallRef.value = wallsRef.value?.at(0);
  console.log('All walls ref', wallsRef.value, myWallRef.value);
  // const { verticles: oldVerticles } = oldMap;

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
  console.log("Mounted polygon");
});
</script>
