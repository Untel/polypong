<style lang="scss" scoped>
  .coalition-box {
    height: 200px;
    width: 800px;
  }
</style>

<template setup>
  <q-page>
    <flat-surface-shader
      v-for="coalition in coalitions"
      class="coalition-box"
      v-bind="coalition.shaderConfig"
    >
      <div>{{ coalition.name }}</div>
    </flat-surface-shader>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from '@vue/reactivity';
import { Coalition } from 'src/types'
import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';
import { useAllianceShaders, useAssemblyShaders, useFederationShaders, useOrderShaders } from 'src/utils/shaders';

export default defineComponent({
  name: 'CoalitionPage',
  components: { FlatSurfaceShader },
  setup() {
    const coalitions: Coalition[] = [{
      name: 'The alliance',
      shaderConfig: useAllianceShaders(),
    }, {
      name: 'The assembly',
      shaderConfig: useAssemblyShaders(),
    }, {
      name: 'The federation',
      shaderConfig: useFederationShaders(),
    }, {
      name: 'The order',
      shaderConfig: useOrderShaders(),
    }]
    return {
      coalitions,
    };
  },
});
</script>
