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

.wrapper {
  min-height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
}

#myctn {
  z-index: 2;
  position: absolute;
}

</style>
<template>
  <q-page>
    <!-- LE JEU -->
    <FssFallback class="wrapper">
      <div id="myctn"></div>
      <PolygonMap class="map" ref="mapEl" :map="mapProps" :paddles="paddles" :balls="balls" :powers="powers"
        @paddleMove="updatePaddlePercent">
      </PolygonMap>
    </FssFallback>
    <q-btn @click="togglePause()" :icon=" isPaused === 'true' ? 'play_arrow' : 'pause'">
      {{ isPaused === 'true' ? 'Play' : 'Pause' }}
    </q-btn>
    <q-btn dense @click="tick()">
      tick
    </q-btn>
    <q-btn dense @click="reset()">
      reset
    </q-btn>
    <pre>
      {{ balls }}
      {{ paddles }}
    </pre>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, StyleValue, Ref, watch, computed, VueElement } from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import { useApi } from 'src/utils/api';
import { Position, Paddle, Ball } from 'src/utils/game';
import { MaybeElementRef, useMouseInElement } from '@vueuse/core'
import PolygonMap from 'src/components/PolygonMap.vue';
import FssFallback from 'src/components/FssFallback.vue';
import { Notify } from 'quasar';
import * as PIXI from 'pixi.js';


onMounted(() => {

  var polygonBackgroundSvg = document.getElementsByClassName("svg-test wrapper map")[0];

  let app = new PIXI.Application({ 
    transparent: true,
    resizeTo: polygonBackgroundSvg
  });


  const ctn = document.querySelector('#myctn');
  // console.log("Ctn found", ctn);
  ctn?.appendChild(app.view);


            // var app = new PIXI.Application({
            //     backgroundColor: 0x2980b9
            // });

            // // Add application to the DOM
            // document.body.appendChild(app.view);

  
  // var renderer = PIXI.autoDetectRenderer(
  //     window.innerWidth, 
  //     window.innerHeight, 
  //     {
  //         backgroundColor : 0xffffff,
  //         resolution:500
  //     }
  // );

  // var beeSvg = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/bee.svg";
  // beeTexture = new PIXI.Texture.fromImage(beeSvg, undefined, undefined, 1.0);
  // var bee = new PIXI.Sprite(beeTexture)




  let sprite = PIXI.Sprite.from('../sample.png');
  app.stage.addChild(sprite);

  // Add a variable to count up the seconds our demo has been running
  let elapsed = 0.0;
  // Tell our application's ticker to run a new callback every frame, passing
  // in the amount of time that has passed since the last tick
  app.ticker.add((delta) => {
    // Add the time to our total elapsed time
    elapsed += delta;
    // Update the sprite's X position based on the cosine of our elapsed time.  We divide
    // by 50 to slow the animation down a bit...
    sprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
  });

  let frame = new PIXI.Graphics();
  frame.beginFill(0x666666);
  frame.lineStyle({ color: 0xffffff, width: 4, alignment: 0 });
  frame.drawRect(0, 0, 208, 208);
  frame.position.set(320 - 100, 180 - 100);
  app.stage.addChild(frame);

  // Create a graphics object to define our mask
  let mask = new PIXI.Graphics();
  // Add the rectangular area to show
  mask.beginFill(0xffffff);
  mask.drawRect(0,0,200,200);
  mask.endFill();

  // Add container that will hold our masked content
  let maskContainer = new PIXI.Container();
  // Set the mask to use our graphics object from above
  maskContainer.mask = mask;
  // Add the mask as a child, so that the mask is positioned relative to its parent
  maskContainer.addChild(mask);
  // Offset by the window's frame width
  maskContainer.position.set(4,4);
  // And add the container to the window!
  frame.addChild(maskContainer);

  // Create contents for the masked container
  let text = new PIXI.Text(
    'This text will scroll up and be masked, so you can see how masking works.  Lorem ipsum and all that.\n\n' +
    'You can put anything in the container and it will be masked!',
    {
      fontSize: 24,
      fill: 0x1010ff,
      wordWrap: true,
      wordWrapWidth: 180
    }
  );
  text.x = 10;
  maskContainer.addChild(text);

  // Add a ticker callback to scroll the text up and down
  let elapsed2 = 0.0;
  app.ticker.add((delta) => {
    // Update the text's y coordinate to scroll it
    elapsed2 += delta;
    text.y = 10 + -100.0 + Math.cos(elapsed2/50.0) * 100.0;
  });

});

const { socket } = useAuthStore();

const paddles: Ref<Paddle[]> = ref([]);
const balls: Ref<Ball[]> = ref([]);
const powers: Ref<any[]> = ref([]);
const info: Ref<object> = ref();
const mapEl: Ref<InstanceType<typeof PolygonMap>> = ref();

const props = defineProps({
  lobbyId: Number,
});

const {
  data: isPaused,
  execute: togglePause,
} = useApi<string>('pong/pause', { immediate: false });

const updatePaddlePercent = (percent: number) => {
  socket?.emit('paddlePercent', percent);
};

const update = (evt: any) => {
  const { balls: b, paddles: p, ...rest } = evt;
  if (b) balls.value = b;
  if (p) paddles.value = p;
};

const mapProps: Ref<{ verticles: number[], angles: number[] }> = ref({
  verticles: [],
  angles: [],
});
const mapChange = (res) => {
  // change map
  mapProps.value = res;
};

const powersUpdate = (res) => {
  // add mes powers
  powers.value = res;
};

const printTimer = ({ timer }: { timer: number }) => {
  Notify.create({
    timeout: timer,
    progress: true,
    position: 'top',
    message: `New round will start`,
  });
};

socket?.on('gameUpdate', update);
socket?.on('mapChange', mapChange);
socket?.on('powers', powersUpdate);
socket?.on('timer', printTimer);

const {
  data: tickValue,
  execute: tick,
} = useApi('pong/tick', { immediate: false }).json();

const {
  data: test,
  execute: reset,
} = useApi('pong/reset', { immediate: false });
</script>
