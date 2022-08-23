<style scoped lang="scss">
  .wrapper {
  }
</style>

<template>
  <q-page class="row">
    <WhatsApp
      :threads="$thread.threads"
      :currentThread="$thread.current"
      @selectThread="(t: Thread) => $router.push(`/inbox/${t.id}`)"
      @sendMessage="(m: string) => $thread.sendMessage(m)"
    >
      <template v-if="$thread.current">
        <q-chat-message
          v-for="(message, index) in $thread.current.messages"
          :key="`message-${index}`"
          :text="[message.content]"
          :avatar="message.sender.user.avatar"
          :sent="message.sender.user.id === $auth.user.id"
        >
        </q-chat-message>
      </template>
      <p v-else>Select a thread to start with</p>
    </WhatsApp>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Thread, useThreadStore } from 'src/stores/thread.store';
import WhatsApp from 'src/components/WhatsApp.vue';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { Notify } from 'quasar';
import { MandeError } from 'mande';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

watch(
  () => $route.params.id,
  (id) => {
    try {
      $thread.getOrCreateThread(+id);
    } catch (e: MandeError) {
      Notify.create({
        message: e.message,
        color: 'negative',
      });
    }
  },
  { immediate: true },
);
</script>
