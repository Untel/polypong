<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<template>
  <q-page class="row">
    <div class="wrapper">
      <UserBanner :user="auth.user"/>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import UserBanner from 'src/components/UserBanner.vue';

const auth = useAuthStore();
</script>
