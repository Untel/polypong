<style lang="scss">
  .q-drawer--on-top {
    z-index: 5000;
  }

  .bold > * {
    font-weight: bold !important;
  }

  .vue3-emojipicker {
    .mt-4 {
      margin-top: 0 !important;
    }
    .vue3-discord-emojipicker__emojibutton.ml-3 {
      margin-right: 10px !important;
    }

    .vue3-discord-emojipicker {
      &.-top-4 {
        top: -10px !important;
      }
      &.right-0 {
        right: initial !important;
      }
      input {
        width: auto;
      }
    }
  }
    body.body--light {
    .vue3-emojipicker {

      .bg-grey-400 {
        background-color: $grey-1;
      }
      .bg-grey-600 {
        background-color: $grey-2;
      }
      .text-white {
        color: $grey-10 !important;
      }
    }
  }
</style>

<template>
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
                <q-item clickable @click="emit('newChannel')">
                  <q-item-section>New channel</q-item-section>
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

        <q-toolbar class="search-toolbar bg-grey-2">
          <!-- <q-input
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
          </q-input> -->
          <SearchUser />
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
        v-if="currentThread"
        :model-value="rightDrawerOpen"
        class="bg-grey-3"
      >
        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list>
            <template v-if="currentThread.channel && me.status === ThreadMemberStatus.OWNER">
              <q-item-label header>Channel Settings</q-item-label>
              <q-item>
                <SearchUser
                  :excludes="currentThread.participants.map(p => p.user)"
                  @select="$thread.invite"
                  />
              </q-item>
              <q-separator />
            </template>
            <q-item-label header>Participants</q-item-label>
            <q-item
              v-for="(participant, index) in currentThread.participants"
              :key="`participant-${index}`"
              clickable
            >
              <q-item-section avatar>
                <q-avatar>
                  <img :src="participant.user.avatar">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">
                  {{ participant.user.name }}
                </q-item-label>
                <q-item-label class="conversation__summary" caption>
                  <q-icon name="check" v-if="participantSeenLastMessage(participant)" />
                  <template
                    v-if="participant.status === ThreadMemberStatus.OWNER"
                  >
                    <q-icon
                      name="fas fa-crown"
                      color="yellow"
                    />
                    Owner
                  </template>
                  <template
                    v-else-if="participant.status === ThreadMemberStatus.ADMIN"
                  >
                    <q-icon
                      name="fas fa-shield-dog"
                      color="blue"
                    />
                    Admin
                  </template>
                </q-item-label>
              </q-item-section>
              <q-menu>
                <q-list>
                  <q-item
                    v-for="action in actionable(participant)"
                    clickable
                    :key="`p-${participant.id}-${action.label}`"
                    @click="action.fn(participant)"
                  >
                    <q-item-section avatar>
                      <q-icon v-bind="action.icon || { name: 'action' }"></q-icon>
                    </q-item-section>
                    <q-item-section>
                      {{ action.label }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container full-height container class="bg-grey-2">
          <slot />
          <q-page-scroller reverse position="top" :scroll-offset="20" :offset="[0, 18]">
            <q-btn fab icon="keyboard_arrow_down" color="primary" />
          </q-page-scroller>
      </q-page-container>

      <q-footer v-if="currentThread">
        <q-toolbar class="bg-grey-3 row text-black">
          <DiscordPicker
            @emoji="message += $event"
            :api-key="$env.TENOR_API_KEY || ''"
          />
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
import { QIconProps, useQuasar } from 'quasar';
import {
  ref,
  computed,
  PropType,
} from 'vue';
import {
  ActiveThread,
  Thread,
  Participant,
  ThreadMemberStatus,
  useThreadStore,
} from 'src/stores/thread.store';
import moment from 'moment';
import DiscordPicker from 'vue3-discordpicker';
import SearchUser from './SearchUser.vue';

const props = defineProps({
  threads: {
    type: Array<Thread>,
    default: () => [],
  },
  currentThread: {
    type: Object as PropType<ActiveThread | null>,
    default: null,
  },
  me: {
    type: Object as PropType<Participant>,
    default: null,
  },
});

const emit = defineEmits(['selectThread', 'sendMessage', 'newChannel']);

const $q = useQuasar();
const $thread = useThreadStore();
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
function participantSeenLastMessage(participant: Participant) {
  const messages = props.currentThread?.messages;
  if (!messages || !messages.length) return false;
  const lastMessage = messages[messages.length - 1];
  return moment(participant.sawUntil).isBefore(lastMessage.createdAt);
}

interface Action {
  label: string;
  icon?: QIconProps;
  fn: (p: Participant) => void;
}

const fn = (p: Participant) => {
  console.log('Fn', p);
};

function actionable(target: Participant) : Action[] {
  const actions: Action[] = [
    { label: 'Profile', icon: { name: 'fas fa-user-astronaut' }, fn },
  ];

  if (props.me.id !== target.id) {
    if (props.me.status === ThreadMemberStatus.ADMIN
      && target.status < ThreadMemberStatus.ADMIN) {
      actions.push(
        { label: 'Kick', icon: { name: 'fas fa-user-large-slash' }, fn },
        { label: 'Ban', icon: { name: 'fas fa-user-large-slash' }, fn },
        { label: 'Mute', icon: { name: 'fas fa-user-large-slash' }, fn },
      );
    }

    if (props.me.status === ThreadMemberStatus.OWNER
      && target.status < ThreadMemberStatus.ADMIN) {
      actions.push(
        { label: 'Promote admin', icon: { name: 'fas fa-user-shield' }, fn },
      );
    }
    actions.push(
      { label: 'Add friend', icon: { name: 'fas fa-user-plus' }, fn },
      { label: 'Invite to play', icon: { name: 'sports_tennis' }, fn },
      { label: 'Block', icon: { name: 'fas fa-user-lock' }, fn },
    );
  } else {
    actions.push(
      { label: 'Cut notifications', icon: { name: 'fas fa-bell-slash' }, fn },
    );
    if (props.currentThread?.channel) {
      actions.push(
        { label: 'Leave', icon: { name: 'fas fa-door-open' }, fn: $thread.leave },
      );
    }
  }

  return actions;
}

function status(participant: Participant) {
  if (participant.status === ThreadMemberStatus.OWNER) return 'Owner';
  if (participant.status === ThreadMemberStatus.ADMIN) return 'Admin';
  return '';
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
