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
import { watch } from 'vue';
import { Notify } from 'quasar';
import { MandeError } from 'mande';
import moment from 'moment';
import { computedAsync } from '@vueuse/core';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

function reduceClosestMessages(messages: Message[]) {
  return messages.reduce((acc, message) => {
    const lastMessage = acc[acc.length - 1];
    if (lastMessage
      && lastMessage.sender.id === message.sender.id
      && moment(lastMessage.createdAt).diff(message.createdAt, 'minutes') < 10
    ) {
      lastMessage.contents.push(message.content);
      lastMessage.createdAt = message.createdAt;
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

// const dmThread = computedAsync(async () => {
//  if ($route.params.userId) {
//    console.log('wanna chat with : ', $route.params.userId);
//    const userId: number = +$route.params.userId;
//    await $thread.getThreadWithUser(userId);
//    if ($thread._current.channel === undefined) {
//      $route.
//    }
//  }
// });
</script>
