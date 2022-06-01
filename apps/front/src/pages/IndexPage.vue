<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<template>
  <q-page class="row">
    <div class="wrapper">
      <UserBanner />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
  import UserBanner from 'src/components/UserBanner.vue';

</script>
