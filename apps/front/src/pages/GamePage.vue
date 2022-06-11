<template>
  <q-page padding>
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="background-color:white ; width: 500px; height: 500px; position: relative;" ref="world"
        @mousemove="onMouseMove">
        <div style="background-color: red; width: 20px; height: 20px; display: inline-block; position:absolute;"
          ref=" ball">a</div>
        <div style="position:absolute; background-color: green; width: 20px; height: 100px;" ref="paddle1">b</div>
        <div style="position:absolute; background-color: blue; width: 20px; height: 100px;" ref="paddle2">c</div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import { compileScript } from 'vue/compiler-sfc';
const { socket } = useAuthStore();

const world = ref(null),
  ball_ref = ref(null),
  paddle1_ref = ref(null),
  paddle2_ref = ref(null);

let ball: any;
let paddle1: any;
let paddle2: any;
const props = defineProps({
  lobbyId: Number,
});

const onKeyDown = (evt: KeyboardEvent) => {
  console.log("keyboard event", evt)

  socket?.emit('paddleUpdate', evt)
}

const onMouseMove = (evt: MouseEvent) => {
  // console.log("mouse move", evt);
}

const update = (evt: any) => {
  // console.log("Update !");
  ball = evt.ball;
  paddle1 = evt.paddle1;
  paddle2 = evt.paddle2;

  // console.log(ball, paddle1, paddle2);
}

onMounted(() => {
  console.log(ball_ref.value, world.value, paddle1_ref.value, paddle2_ref.value);
  // this.socket.subscribe
  window.addEventListener('keydown', onKeyDown);
});

socket?.on('gameUpdate', update);


</script>
