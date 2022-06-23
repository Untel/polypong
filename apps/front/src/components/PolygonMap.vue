<style lang="scss" scoped>
  .wrapper {
    width: 300px;
    position: relative;

    svg {

    }
  }
</style>

<template>
  <div class="wrapper">
    <svg viewBox="-50 -50 100 100">

      <polygon
        :points="verticlesToPoint"
        fill="yellow" stroke="gray">
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
      <circle fill="red" r="3"
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
      <text
        v-for="vertex in verticles"
        :x="vertex[0]" :y="vertex[1]"
        fill="green" font-size="5"
      >
        {{ vertex[0].toFixed(1) }},{{ vertex[1].toFixed(1) }}
      </text>
      <text
        v-for="ball in balls.filter((b: any) => b.target?.hit)"
        :x="ball.target.hit.x" :y="ball.target.hit.y"
        fill="green" font-size="5"
      >
        {{ ball.target.hit.x.toFixed(1) }},{{ ball.target.hit.y.toFixed(1) }}
      </text>

      <text
        v-for="paddle in paddles"
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
      </text>
    </svg>
    <slot />
    <!-- <pre v-if="paddles && paddles[0]">
      {{ paddles[0].line }}
    </pre> -->
    <pre v-if="balls && balls[0]">
      {{ balls[0].pos }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, PropType, StyleValue } from 'vue';
import { Position, Paddle, Ball } from 'src/utils/game';

const props = defineProps({
  verticles: {
    type: Array as PropType<number[][]>,
    default: () => [],
  },
  paddles: {
    type: Array as any,
    default: () => [],
  },
  balls: {
    type: Array as any,
    default: () => [],
  }
});

function formatPositionStyle(position: Position) {
  const { x, y, h, w } = position;
  return {
    top: `${y}%`,
    left: `${x}%`,
    width: `${w}%`,
    height: `${h}%`,
  };
}

function formatBallTrajectoryPoints(ball: Ball) {
  return {
    x1: ball.position.x,
    x2: ball.target.hit.x,
    y1: ball.position.y,
    y2: ball.target.hit.y,
  }
}

function formatPaddlePoints(paddle: Paddle) {
  return {
    x1: paddle.line[0][0],
    x2: paddle.line[1][0],
    y1: paddle.line[0][1],
    y2: paddle.line[1][1],
  }
}

function formatBallPosition(position: Position) {
  return {
    cx: position.x,
    cy: position.y,
  }
}
function formatPaddleStyle(paddle: Paddle): StyleValue {
  return {
    ...formatPositionStyle(paddle.pos),
    transform: `rotate(${paddle.angle}deg)`,
    backgroundColor: 'green',
  };
}

function formatBallStyle(ball: Ball): StyleValue {
  const style = {
    ...formatPositionStyle(ball.pos),
    backgroundColor: 'red',
  };
  return style;
}

const verticlesToPoint = computed(() => {
  const points = props.verticles
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
  console.log("Computed points", points);
  return points;
});

onMounted(() => {
  console.log("Mounted polygon");
})
</script>
