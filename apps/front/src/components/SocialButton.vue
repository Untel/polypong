<template>
  <q-btn
    :icon=props.icon
    :color=props.color
    rounded dense
    padding="6px 8px"
  >
    {{ label }}
    <q-tooltip anchor="top middle">
      {{ props.tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';

defineComponent({ name: 'SocialButton' });
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  tooltip: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'blue-grey-10',
  },
});

</script>
