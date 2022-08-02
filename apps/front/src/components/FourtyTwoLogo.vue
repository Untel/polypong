<template>
  <q-icon :size="size">
    <svg
      viewBox="0 0 137.6 96.599998">
    <g
      id="g3"
      transform="translate(-229.2,-372.70002)">
      <polygon
        points="229.2,443.9 279.9,443.9 279.9,469.3 305.2,469.3
          305.2,423.4 254.6,423.4 305.2,372.7 279.9,372.7 229.2,423.4 "
        id="polygon5" />
      <polygon
      points="316.1,398.1 341.4,372.7 316.1,372.7 "
      id="polygon7"/>
      <polygon
        points="341.4,398.1 316.1,423.4 316.1,448.7 341.4,448.7
          341.4,423.4 366.8,398.1 366.8,372.7 341.4,372.7 "
        id="polygon9"/>
      <polygon
      points="366.8,423.4 341.4,448.7 366.8,448.7 "
      id="polygon11"/>
    </g>
    </svg>
  </q-icon>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: '5rem',
    required: false,
  },
});
</script>

<style>
</style>
