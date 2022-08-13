<style scoped lang="scss">
  .wrapper {
  }
</style>

<template>
  <q-page class="row">
    <WhatsApp />
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import WhatsApp from 'src/components/WhatsApp.vue';

const auth = useAuthStore();
</script>
