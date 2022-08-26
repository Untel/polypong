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
      @newChannel="() => $thread.newChannel()"
    >
      <q-infinite-scroll @load="() => {}" reverse>
        <!-- <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
        </template> -->

        <template v-if="$thread.current">
          <q-chat-message
            label="This is the begining of your conversation"
          />
          <template
            v-for="({ day, messages }) in splitByDay($thread.current.messages)"
            :key="`day-${day}`"
          >
            <q-chat-message
              :label="day"
            />
            <q-chat-message
              v-for="(message) in reduceClosestMessages(messages)"
              :key="`message-${message.id}`"
              :text="message.contents"
              :name="message.sender.user.name"
              :avatar="message.sender.user.avatar"
              :sent="message.sender.user.id === $auth.user.id"
              :stamp="moment(message.createdAt).fromNow()"
            />

          </template>
        </template>
        <p v-else>Select a thread to start with</p>
    </q-infinite-scroll>
    </WhatsApp>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Thread, Message, useThreadStore } from 'src/stores/thread.store';
import WhatsApp from 'src/components/WhatsApp.vue';
import { useRoute } from 'vue-router';
import { watch, onUnmounted } from 'vue';
import { Notify } from 'quasar';
import { MandeError } from 'mande';
import moment from 'moment';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

function reduceClosestMessages(messages: Message[]) {
  return messages.reduce((acc, message) => {
    const lastMessage = acc[acc.length - 1];
    if (lastMessage
      && lastMessage.sender.id === message.sender.id
      && moment(message.createdAt).diff(moment(lastMessage.createdAt), 'minutes') < 3
    ) {
      acc[acc.length - 1] = { ...message, contents: [...lastMessage.contents, message.content] };
    } else {
      acc.push({ ...message, contents: [message.content] });
    }
    return acc;
  }, [] as Message[]);
}

function splitByDay(messages: Message[]) {
  return messages.reduce((acc, next) => {
    const day = moment(next.createdAt).format('dddd, MMMM Do YYYY');
    const dayIndex = acc.findIndex((d) => d.day === day);
    if (dayIndex === -1) {
      console.log('Creating day indx', day, 'from messages', messages);
      acc.unshift({
        day,
        messages: [next],
      });
    } else {
      acc[dayIndex].messages.unshift(next);
    }
    return acc;
  }, [] as { day: string; messages: Message[] }[]);
}

watch(
  () => $route.params.id,
  (id) => {
    try {
      $thread.getThread(+id);
    } catch (e: MandeError) {
      Notify.create({
        message: e.message,
        color: 'negative',
      });
    }
  },
  { immediate: true },
);
onUnmounted(() => {
  // eslint-disable-next-line no-underscore-dangle
  $thread._current = null;
});
</script>
