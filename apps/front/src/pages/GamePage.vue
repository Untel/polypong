<template>
  <q-page padding>
    <div style="background-color:white" ref="world" @mousemove="onMouseMove">
      <div ref="ball">a</div>
      <div ref="paddle1">b</div>
      <div ref="paddle2">c</div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
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

const onMouseMove = (evt) => {
  console.log("mouse move", evt);
}

const update = (evt) => {
  // console.log("Update !");
  ball = evt.ball;
  paddle1 = evt.paddle1;
  paddle2 = evt.paddle2;

  console.log(ball, paddle1, paddle2);
}

onMounted(() => {
  console.log(ball_ref.value, world.value, paddle1_ref.value, paddle2_ref.value);
  // this.socket.subscribe
});

socket?.on('gameUpdate', update);


</script>
