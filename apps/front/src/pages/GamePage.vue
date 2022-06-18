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
</style>
<template>
  <q-page padding>
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="background-color:white ; width: 500px; height: 500px; position: relative;" ref="world"
        @mousemove="onMouseMove">
        <div class="ball"
           v-for="ball in balls"
          :style="formatBallStyle(ball)">a</div>
        <div class="paddle"
          v-for="paddle in paddles"
          :style="formatPaddleStyle(paddle)"
        >
        </div>
        <!-- <div style="position:absolute; background-color: blue; width: 20px; height: 100px;" ref="paddle2">c</div> -->
      </div>
    </div>
    <pre style="background-color: aquamarine;">
      Paddle : {{ paddle1Style }}
      Ball : {{ ballStyle }}
    </pre>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, StyleValue, Ref } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
const { socket } = useAuthStore();

let ball: any;
let paddle1: any;
let paddle2: any;

class Position {
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
}

class Paddle {
  pos: Position = { x: 0, y: 0, w: 0, h: 0 };
}
class Ball {
  pos: Position = { x: 0, y: 0, w: 0, h: 0 };
}

const paddle1Style = ref<StyleValue>();
const ballStyle = ref<StyleValue>();

const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);

const props = defineProps({
  lobbyId: Number,
});

const onKeyDown = (evt: KeyboardEvent) => {
  socket?.emit('paddleUpdate', evt.key);
}

function formatPositionStyle(position: Position) {
  const { x, y, h, w } = position;
  return {
    top: `${y}px`,
    left: `${x}px`,
    width: `${w}px`,
    height: `${h}px`,
  };
}

function formatPaddleStyle(paddle: Paddle): StyleValue {
  return {
    ...formatPositionStyle(paddle.pos),
    backgroundColor: 'green',
  };
}

function formatBallStyle(ball: Ball): StyleValue {
  const style = {
    ...formatPositionStyle(ball.pos),
    backgroundColor: 'red',
  };
  console.log('Style', style);
  return style;
}

const onMouseMove = (e: MouseEvent) => {

  var rect = e.target.getBoundingClientRect();
  console.log(rect)

  console.log(e.clientY);
  var y = e.clientY - rect.top - 50;  //y position within the element.
  console.log("y = ", y)
  y = (y < 0) ? 0 : y;
  y = (y > 400) ? 400 : y;

  socket?.emit('paddleMouseUpdate', { y });
}

const update = (evt: any) => {
  console.log('Event', evt);
  balls.value = evt.balls;
  paddles.value = evt.paddles;
}

onMounted(() => {
  // console.log(ball_ref.value, world.value, paddle1_ref.value, paddle2_ref.value);
  window.addEventListener('keydown', onKeyDown);
});

socket?.on('gameUpdate', update);


</script>
