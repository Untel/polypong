<style lang="scss" scoped>
  .wrapper {
  }
</style>

<template>
  <svg class="wrapper" viewBox="-50 -50 100 100">
    <polygon
      :points="verticlesToPoint"
      fill="red" stroke="blue">
      <slot />
    </polygon>
  </svg>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';

const props = defineProps({
  verticles: {
    type: Array as PropType<Array<Array<number>>>,
    default: () => [],
  }
});

const verticlesToPoint = computed(() => {
  const points = props.verticles
    .map(([x, y]) => `${x} ${y}`)
    .join(',');
  console.log("Computed points", points);
  return points;
});

onMounted(() => {
  console.log("Mounted polygon");
})
</script>
