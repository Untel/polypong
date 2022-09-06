<style scoped lang="scss">
</style>

<template>
  <q-page padding>
    <q-infinite-scroll @load="() => {}" reverse>
      <q-list>
        <q-item
          v-for="channel in $thread.channels"
          :key="`chan-${channel.id}`"
        >
          Channel {{ channel.id }}
        </q-item>
      </q-list>
    </q-infinite-scroll>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Message, useThreadStore } from 'src/stores/thread.store';
import { useRoute } from 'vue-router';
import { watch, onUnmounted, onMounted } from 'vue';
import moment from 'moment';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

onMounted(() => {
  $thread.fetchChannels();
});

</script>
