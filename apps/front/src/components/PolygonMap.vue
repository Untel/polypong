<style lang="scss" scoped>
  .wrapper {
    width: 300px;
    position: relative;
    svg {
      polygon {
        fill: white;
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
  <!-- <filter ref="filterRef" id="displacementFilter">
    <feTurbulence type="turbulence" baseFrequency="0.3" numOctaves="2" result="turbulence"/>
    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="50" xChannelSelector="R" yChannelSelector="G"/>
  </filter> -->
      <polygon
        ref="polygonRef">
      </polygon>

      <line
        v-for="paddle in paddles"
        :stroke="paddle.color"
        stroke-width="2px"
        v-bind="formatPaddlePoints(paddle)"
      />
      <circle fill="green" r="3"
        v-for="ball in balls"
        v-bind="formatBallPosition(ball.position)"
      />
      <circle fill="red" r="1"
        v-for="ball in balls.filter((b: any) => b.target?.hit)"
        v-bind="formatBallPosition(ball.target.hit)"
      />
      <line
        stroke="red"
        stroke-width="0.5px"
        stroke-dasharray="2"
        v-for="ball in balls"
        v-bind="formatBallTrajectoryPoints(ball)"
      />
      <!-- <text
        v-for="vertex in map.verticles"
        :x="vertex[0]" :y="vertex[1]"
        fill="green" font-size="5"
      >
        {{ vertex[0].toFixed(1) }},{{ vertex[1].toFixed(1) }}
      </text> -->
      <!-- <text
        v-for="ball in balls.filter((b: any) => b.target?.hit)"
        :key="ball"
        :x="ball.target.hit.x" :y="ball.target.hit.y"
        fill="green" font-size="5"
      >
        {{ ball.target.hit.x.toFixed(1) }},{{ ball.target.hit.y.toFixed(1) }}
      </text>

      <text
        v-for="paddle in paddles"
        :key="paddle"
        :x="paddle.line[0][0]" :y="paddle.line[0][1]"
        fill="orange" font-size="5"
      >
        {{ paddle.name }} - {{ paddle.line[0][0].toFixed(1) }}, {{paddle.line[0][1].toFixed(1) }}
      </text>
      <text
        v-for="paddle in paddles"
        :x="paddle.line[1][0]" :y="paddle.line[1][1]"
        fill="orange" font-size="5"
      >
        {{ paddle.name }} - {{ paddle.line[1][0].toFixed(1) }}, {{paddle.line[1][1].toFixed(1) }}
      </text> -->
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

function formatBallTrajectoryPoints(ball: Ball) {
  return {
    x1: ball.position.x,
    x2: ball.target.hit.x,
    y1: ball.position.y,
    y2: ball.target.hit.y,
  };
}

function formatPaddlePoints(paddle: Paddle) {
  return {
    x1: paddle.line[0][0],
    x2: paddle.line[1][0],
    y1: paddle.line[0][1],
    y2: paddle.line[1][1],
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

watch(() => props.map, (map, oldMap) => {
  const { verticles, angles } = map;
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
        { rotate: angles[0] },
      ],
      scale: -1,
    });
}, { immediate: false });

onMounted(() => {
  console.log("Mounted polygon");
});
</script>
