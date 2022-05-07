<style scoped lang="scss">
  .fallback {
    background-size: cover;
  }
</style>

<template>
  <FlatSurfaceShader v-if="settings.getIsLowPerf" v-bind="props.fssSettings">
    <slot />
  </FlatSurfaceShader>
  <div v-else class="fallback" :style="fallbackStyle">
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { useSettingsStore } from 'src/stores/settings';
  import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';
  import { computed } from '@vue/reactivity';
  const props = defineProps({
    fallbackUrl: String,
    fssSettings: Object,
  });
  function getFullUrl(relativeUrl: string) {
    return new URL(relativeUrl, import.meta.url).href
  }
  const fallbackStyle = computed(() => {
    return { background: `url(${getFullUrl(props.fallbackUrl || '')})` };
  })
  const settings = useSettingsStore();
</script>