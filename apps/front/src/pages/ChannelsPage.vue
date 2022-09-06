<style scoped lang="scss">
</style>

<template>
  <q-page padding>
    <q-infinite-scroll @load="() => {}" reverse>

    </q-infinite-scroll>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Message, useThreadStore } from 'src/stores/thread.store';
import { useRoute } from 'vue-router';
import { watch, onUnmounted } from 'vue';
import moment from 'moment';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

</script>
