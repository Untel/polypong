<style scoped lang="scss">
</style>

<template>
  <q-page padding>
    <q-infinite-scroll @load="() => {}" reverse>
      <q-list>
        <q-item
          clickable
          v-for="channel in $thread.channels"
          :key="`chan-${channel.id}`"
          :to="{ name: 'thread', params: { id: channel.thread.id } }"
        >
          <q-item-section avatar>
            <q-avatar class="bg-grey-2">
              <img v-if="!channel.joined" :src="channel.initiator.avatar"/>
              <q-icon v-else color="green" name="fa-regular fa-circle-check" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ channel.name }}
            </q-item-label>
          </q-item-section>
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
