<template>
  <q-layout full-height>
    <q-page-container>
      <q-page>
        <flat-surface-shader
          type="canvas"
          style="height: 100%; min-height: 984px;"
          :light="{ambient: '#22bc9e', diffuse: '#2b7c6b', draw: true}"
          :mesh="{segments: 20, slices: 20, width: 1.8, height: 1.8}">
          <!-- <div style="height: 100%; width: 100%">
            yolo
          </div> -->
        </flat-surface-shader>
      </q-page>
      </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';

export default defineComponent({
  name: 'LoginPage',
  components: { FlatSurfaceShader },
  setup() {
    return { };
  },
});
</script>
