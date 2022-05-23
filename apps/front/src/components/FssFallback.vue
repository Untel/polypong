<style scoped lang="scss">
  .fallback {
    height: 100%;
    background-size: cover;
  }
</style>

<template>
  <FlatSurfaceShader v-if="!settings.getIsLowPerf" v-bind="{...props.fssSettings}">
    <slot />
  </FlatSurfaceShader>
  <div v-else class="fallback" :style="fallbackStyle">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'src/stores/settings';
import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';
import { Dark } from 'quasar';
import { PropType, computed } from 'vue';
import { ShaderConfig } from 'src/types';
const props = defineProps({
  fallbackUrl: {
    type: String,
    default: '',
  },
  fssSettings: Object as PropType<ShaderConfig>,
});
function getFullUrl(relativeUrl: string) {
  return new URL(relativeUrl, import.meta.url).href
}
const fallbackStyle = computed(() => {
  const fallbackUrl = getFullUrl(props.fallbackUrl);
  console.log('Getting fallback url', props.fallbackUrl, 'then', fallbackUrl);
  const styles: any = { backgroundImage: `url(${fallbackUrl})` };
  if (!Dark.isActive) {
    styles.filter = 'brightness(2)';
  }
  return styles;
})
const settings = useSettingsStore();
</script>