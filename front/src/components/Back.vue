<template>
  <FlatSurfaceShader v-if="isLowPerf" v-bind="$attrs">
    <slot />
  </FlatSurfaceShader>
  <div :style="fallbackStyle" v-else>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';

  const props = defineProps({
    isLowPerf: String,
    fallbackUrl: String,
  });

  const fallbackStyle = {
    background: `url(${new URL(props.fallbackUrl || '', import.meta.url).href}))`,
  }
</script>