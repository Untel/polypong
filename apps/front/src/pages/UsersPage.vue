<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<template>
  <q-page class="row">
    <pre v-for="user in auth.getConnectedUsers">
      {{ user }}
    </pre>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';

const auth = useAuthStore();
auth.fetchConnectedUsers();
</script>
