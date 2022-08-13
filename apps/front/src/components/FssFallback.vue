<style scoped lang="scss">
  .fallback {
    height: 100%;
    max-height: inherit;
    background-size: cover;
  }
</style>

<template>
  <FlatSurfaceShader
    v-bind="fssSettings"
    :shouldAnimate="!settings.getIsLowPerf"
  >
    <slot />
  </FlatSurfaceShader>
</template>

<script lang="ts" setup>
import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';
import { useSettingsStore } from 'src/stores/settings';
import { PropType } from 'vue';
import { ShaderConfig } from 'src/types';
import { useLoginShaders } from 'src/utils/shaders';

const props = defineProps({
  fssSettings: {
    type: Object as PropType<ShaderConfig>,
    default: useLoginShaders(),
  },
});
const settings = useSettingsStore();
</script>
