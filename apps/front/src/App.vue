<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from './stores/settings';

const $q = useQuasar();
const $settings = useSettingsStore();
const { theme } = storeToRefs($settings);
watch(theme, (val) => {
  switch (val) {
    case 'light':
      $q.dark.set(false);
      break;
    case 'dark':
      $q.dark.set(true);
      break;
    case 'auto':
    default:
      $q.dark.set('auto');
      break;
  }
}, { immediate: true });
</script>

<style lang="scss">
  body.body--dark {
    .bg-grey-4 {
      background-color: $grey-10 !important;
    }
    .bg-grey-3 {
      background-color: $grey-9 !important;
    }
    .bg-grey-2 {
      background-color: $grey-8 !important;
    }
    .bg-white {
      background-color: $grey-7 !important;
    }
    .text-black {
      color: $grey-1 !important;
    }
  }
</style>
