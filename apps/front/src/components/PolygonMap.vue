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

    .ball {
      fill: rgba(81, 5, 5, 0.9);
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
    <svg viewBox="-60 -60 150 150" transform="rotate()" ref="svgRef">
      <!-- <filter ref="filterRef" id="displacementFilter">
    <feTurbulence type="turbulence" baseFrequency="0.3" numOctaves="2" result="turbulence"/>
    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="50" xChannelSelector="R" yChannelSelector="G"/>
  </filter> -->
      <polygon ref="polygonRef">
      </polygon>

      <line v-for="(wall, idx) in map.walls || []" :class="{ 'mine': idx === 0 }" ref="wallsRef" class="wall"
        stroke-width="1px" v-bind="formatLine(wall.line)" />
      <line v-for="paddle in paddles" :stroke="paddle.color" stroke-width="2px" v-bind="formatLine(paddle.line)" />
      <circle class="ball" fill="green" r="3" v-for="ball in balls" v-bind="formatBallPosition(ball.position)" />
      <circle fill="red" r="1" v-for="ball in balls.filter((b: any) => b.target?.hit)"
        v-bind="formatBallPosition(ball.target.hit)" />

      <circle fill="black" r="1" v-for="ball in balls.filter((b: any) => b.newTarget)" :cx="ball.newTarget[0]"
        :cy="ball.newTarget[1]" />
      <line stroke="red" stroke-width="0.5px" stroke-dasharray="2" v-for="ball in balls"
        v-bind="formatBallTrajectoryPoints(ball)" />
      <text v-for="vertex in map.verticles" :x="vertex[0]" :y="vertex[1]" fill="green" font-size="5">
        {{ vertex[0].toFixed(1) }},{{ vertex[1].toFixed(1) }}
      </text>
      <text v-for="ball in balls.filter((b: any) => b.target?.hit)" :key="ball" :x="ball.target.hit.x"
        :y="ball.target.hit.y" fill="green" font-size="5">
        {{ ball.target.hit.x.toFixed(1) }},{{ ball.target.hit.y.toFixed(1) }}
      </text>

      <text v-for="paddle in paddles" :key="paddle" :x="paddle.line[0][0]" :y="paddle.line[0][1]" fill="orange"
        font-size="5">
        {{ paddle.name }} - {{ paddle.line[0][0].toFixed(1) }}, {{ paddle.line[0][1].toFixed(1) }}
      </text>
      <text v-for="paddle in paddles" :x="paddle.line[1][0]" :y="paddle.line[1][1]" fill="orange" font-size="5">
        {{ paddle.name }} - {{ paddle.line[1][0].toFixed(1) }}, {{ paddle.line[1][1].toFixed(1) }}
      </text>
    </svg>
    <slot />
    <!-- <pre v-if="paddles && paddles[0]">
      {{ paddles[0].line }}
    </pre> -->
    <!-- <pre v-if="balls && balls[0]">
      {{ balls[0].pos }}
    </pre> -->
    <!-- <q-btn @click="test">test</q-btn> -->
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

function formatBallPosition(position: Position) {
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
  console.log('M is', m);
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
        // { rotate: 0 },
        // { rotate: 360 - angles[0] + 180 },
      ],
    });
}, { immediate: false });

onMounted(() => {
  console.log("Mounted polygon");
});
</script>
