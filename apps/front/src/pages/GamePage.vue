<style lang="scss" scoped>
.paddle {
  position: absolute;
  background-color: green;
  width: 20px;
  height: 100px;
}
</style>
<template>
  <q-page padding>
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="background-color:white ; width: 500px; height: 500px; position: relative;" ref="world"
        @mousemove="onMouseMove">
        <div style="background-color: red; width: 20px; height: 20px; display: inline-block; position:absolute;"
          ref=" ball">a</div>
        <div class="paddle" :style="paddle1Style" ref="paddle1">b</div>
        <!-- <div style="position:absolute; background-color: blue; width: 20px; height: 100px;" ref="paddle2">c</div> -->
      </div>
    </div>
    <pre style="background-color: aquamarine;">
      {{ paddle1Style }}
    </pre>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, StyleValue } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import { compileScript } from 'vue/compiler-sfc';
import CoalitionSelectorVue from 'src/components/CoalitionSelector.vue';
const { socket } = useAuthStore();

const world = ref<HTMLElement>(),
  ball_ref = ref<HTMLElement>(),
  paddle1_ref = ref<HTMLElement>(),
  paddle2_ref = ref<HTMLElement>();

let ball: any;
let paddle1: any;
let paddle2: any;

const paddle1Style = ref<StyleValue>();
const props = defineProps({
  lobbyId: Number,
});

const onKeyDown = (evt: KeyboardEvent) => {
  socket?.emit('paddleUpdate', evt.key)
}

const onMouseMove = (evt: MouseEvent) => {
  // console.log("mouse move", evt);
}

const update = (evt: any) => {
  ball = evt.ball;
  paddle1 = evt.paddle1;
  paddle2 = evt.paddle2;

  paddle1Style.value = { top: paddle1.y + 'px', left: paddle1.x + 'px ' }
}

onMounted(() => {
  console.log(ball_ref.value, world.value, paddle1_ref.value, paddle2_ref.value);
  // this.socket.subscribe
  window.addEventListener('keydown', onKeyDown);
});

socket?.on('gameUpdate', update);


</script>
