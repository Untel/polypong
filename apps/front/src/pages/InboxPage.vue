<style scoped lang="scss">
  .column-reverse {
    display: flex;
    flex-direction: column-reverse;
    max-height: 100%;
    overflow: scroll;
  }
  .system-message {
  }
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
    >
      <q-page padding class="column-reverse">
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
              <template
                v-for="(message) in reduceClosestMessages(messages)"
                :key="`message-${message.id}`"
              >
                <q-chat-message
                  v-if="message.sender"
                  :text="message.contents"
                  :name="message.sender.name"
                  :avatar="message.sender.avatar"
                  :sent="message.sender.id === $auth.user.id"
                  :stamp="moment(message.createdAt).fromNow()"
                />
                <q-chat-message
                  v-else
                  :label="message.content"
                >
                  <template v-slot:label>
                    <q-badge multiline color="primary">
                      <q-icon name="fas fa-note-sticky"/>
                      {{ message.content }}
                    </q-badge>
                  </template>
                </q-chat-message>
              </template>

            </template>
          </template>
          <p v-else>Select a thread to start with</p>
        </q-infinite-scroll>
      </q-page>
    </WhatsApp>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Thread, Message, useThreadStore } from 'src/stores/thread.store';
import WhatsApp from 'src/components/WhatsApp.vue';
import { useRoute } from 'vue-router';
import { watch, onUnmounted } from 'vue';
import moment from 'moment';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

function reduceClosestMessages(messages: Message[]) {
  return messages.reduce((acc, message) => {
    const lastMessage = acc[acc.length - 1];
    if (lastMessage && lastMessage.sender && message.sender
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
  (id) => $thread.getThread(+id),
  { immediate: true },
);
onUnmounted(() => {
  // eslint-disable-next-line no-underscore-dangle
  $thread._current = null;
});
</script>
