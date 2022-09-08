<style scoped lang="scss">
</style>

<template>
  <q-page>
    <WhatsApp
      :threads="$thread.threads"
      :currentThread="$thread.current"
      :me="$thread.current?.participants.find((e) => e.user.id === $auth.user.id)"
      @selectThread="(t: Thread) => $router.push(`/inbox/${t.id}`)"
      @sendMessage="(m: string) => $thread.sendMessage(m)"
      @newChannel="() => $thread.newChannel()"
      @channelUpdate="(evt) => $thread.updateChannel(evt)"
    >
      <router-view />
    </WhatsApp>
  </q-page>
</template>

<script lang="ts" setup>
import { onUnmounted, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Thread, useThreadStore } from 'src/stores/thread.store';
import { useAuthStore } from 'src/stores/auth.store';
import WhatsApp from 'src/components/WhatsApp.vue';
import { useSocialStore } from 'src/stores/social.store';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();
const $social = useSocialStore();

watch(
  () => $route.params.id,
  (id) => {
    if ($route.path.includes('inbox')) {
      $thread.getThread(+id);
    }
  },
  { immediate: true },
);
onUnmounted(() => {
  // eslint-disable-next-line no-underscore-dangle
  $thread._current = null;
});
onMounted(() => {
  $thread.fetchThreads();
  $social.fetchRelationships();
});

</script>
