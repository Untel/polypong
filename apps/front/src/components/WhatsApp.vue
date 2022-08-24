<style lang="scss" scoped>
  .q-drawer--on-top {
    z-index: 5000;
  }
  .column-reverse {
    display: flex;
    flex-direction: column-reverse;
  }

  .bold > * {
    font-weight: bold !important;
  }
</style>

<template>
  <!-- lHr lpr lfr -->
  <!-- lHh Lpr lFf -->
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout view="lHh LpR lFr" class="WAL__layout shadow-3" container>
      <q-header elevated>
        <q-toolbar class="bg-grey-3 text-black">
          <q-btn
            round
            flat
            icon="keyboard_arrow_left"
            class="WAL__drawer-open q-mr-sm"
            @click="toggleLeftDrawer"
          />

          <q-btn round flat>
            <q-avatar>
              <!-- <img :src="currentThread.avatar"> -->
            </q-avatar>
          </q-btn>

          <span class="q-subtitle-1 q-pl-md">
            <!-- {{ currentConversation.person }} -->
          </span>

          <q-space/>

          <q-btn round flat icon="search" />
          <q-btn round flat>
            <q-icon name="attachment" class="rotate-135" />
          </q-btn>
          <q-btn round flat @click="rightDrawerOpen = !rightDrawerOpen">
            {{ rightDrawerOpen ? 'X' : 'V' }}
          </q-btn>
          <q-btn round flat icon="more_vert">
            <q-menu auto-close :offset="[110, 0]">
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        :breakpoint="690"
      >
        <q-toolbar class="bg-grey-3">
          <q-avatar class="cursor-pointer">
            <q-icon name="fab fa-whatsapp" />
          </q-avatar>

          <q-space />

          <q-btn round flat icon="message" />
          <q-btn round flat icon="more_vert">
            <q-menu auto-close :offset="[110, 8]">
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>New group</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Archived</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Favorites</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            round
            flat
            icon="close"
            class="WAL__drawer-close"
            @click="toggleLeftDrawer"
          />
        </q-toolbar>

        <q-toolbar class="bg-grey-2">
          <q-input
            rounded
            outlined
            dense
            class="WAL__field full-width"
            v-model="search"
            placeholder="Search or start a new conversation"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar>

        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list>
            <q-item
              v-for="(thread, index) in threads"
              :key="`thread-${index}`"
              clickable
              @click="$emit('selectThread', thread)"
              :active="thread.id === currentThread?.id"
              :class="{ bold: thread.unreadMessages.length > 0 }"
            >
              <q-item-section avatar>
                <q-avatar class="bg-grey-2">
                  <img v-if="thread.avatar && thread.avatar !== 'group'" :src="thread.avatar">
                  <q-icon v-else name="group" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ thread.recipient?.name }}</q-item-label>
                <q-item-label caption lines="2">{{ thread.lastMessage?.content }}</q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-item-label caption>
                  {{ moment(thread.lastMessage.createdAt).format('HH:mm') }}
                </q-item-label>
                <q-badge
                  v-if="thread.unreadMessages.length"
                  color="red"
                  :label="`${thread.unreadMessages.length}`"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-drawer
        side="right"
        show-if-above
        bordered
        v-model="rightDrawerOpen"
      >
        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list>
            <!-- <q-item
              v-for="(thread, index) in threads"
              :key="`thread-${index}`"
              clickable
              v-ripple
              @click="$emit('selectThread', thread)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <img :src="thread.participants[0]?.user.avatar">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">
                  {{ thread.recipient.username }}
                </q-item-label>
                <q-item-label class="conversation__summary" caption>
                  <q-icon name="check" v-if="conversation.sent" />
                  <q-icon name="not_interested" v-if="conversation.deleted" />
                  {{ thread.recipient.username }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption>
                  {{ thread.createdAt }}
                </q-item-label>
                <q-icon name="keyboard_arrow_down" />
              </q-item-section>
            </q-item> -->
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container full-height container class="bg-grey-2">
        <q-page class="column-reverse" padding>
          <slot />
          <q-page-scroller reverse position="top" :scroll-offset="20" :offset="[0, 18]">
            <q-btn fab icon="keyboard_arrow_down" color="primary" />
          </q-page-scroller>
        </q-page>
      </q-page-container>

      <q-footer>
        <q-toolbar class="bg-grey-3 row text-black">
          <q-btn round flat icon="insert_emoticon" class="q-mr-sm" />
          <q-input
            rounded
            outlined
            dense
            class="WAL__field col-grow q-mr-sm"
            placeholder="Type a message"
            @keydown.enter.prevent="sendMessage"
            v-model.trim="message"
          />
          <q-btn round flat icon="send" @click="sendMessage"/>
        </q-toolbar>
      </q-footer>
    </q-layout>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref, computed, PropType } from 'vue';
import { ActiveThread, Thread } from 'src/stores/thread.store';
import moment from 'moment';

defineProps({
  threads: {
    type: Array<Thread>,
    default: () => [],
  },
  currentThread: {
    type: Object as PropType<ActiveThread | null>,
    default: null,
  },
});

const emit = defineEmits(['selectThread', 'sendMessage']);

const $q = useQuasar();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const search = ref('');
const message = ref('');
const style = computed(() => ({
  height: `${$q.screen.height - 50}px`,
}));
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
function sendMessage() {
  emit('sendMessage', message.value);
  message.value = '';
}
function threadAvatar(thread: Thread) {
  if (thread.channel) {
    return 'group';
  }
  return thread.recipient?.avatar || 'https://cdn.quasar.dev/img/avatar.png';
}
function containerStyleFn(offset) {
  // "offset" is a Number (pixels) that refers to the total
  // height of header + footer that occupies on screen,
  // based on the QLayout "view" prop configuration

  // this is actually what the default style-fn does in Quasar
  return {
    minHeight: offset ? `calc(100vh - ${offset}px)` : '100vh',
    maxHeight: offset ? `calc(100vh - ${offset}px)` : '100vh',
  };
}
</script>

<style lang="sass">
.WAL
  width: 100%
  height: 100%
  padding-top: 20px
  padding-bottom: 50px
  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%
    background-color: #009688
  &__layout
    margin: 0 auto
    height: 100%
    width: 90%
    border-radius: 5px
  &__field.q-field--outlined .q-field__control:before
    border: none
  .q-drawer--standard
    .WAL__drawer-close
      display: none
@media (max-width: 1025px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0
@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none
.conversation__summary
  margin-top: 4px
.conversation__more
  margin-top: 0!important
  font-size: 1.4rem
</style>
