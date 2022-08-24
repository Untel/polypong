<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img :src="$auth.user.avatar" alt="">
        </q-avatar>
        <q-toolbar-title>
          {{ $auth.user.name }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      bordered
      mini-to-overlay
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      :width="200"
      :breakpoint="0"
    >
      <FourtyTwoLogo :size="miniState && '2rem' || '5rem'" />
      <EssentialLink title="Home" caption="Home page" icon="fas fa-igloo" to="home"/>
      <EssentialLink title="Login" caption="Login page" icon="fab fa-connectdevelop" to="login"/>
      <EssentialLink title="Coalitions" caption="Coalitions page"
        icon="fas fa-group-arrows-rotate" to="coalitions"/>
      <EssentialLink title="Lobbies" caption="Find a lobby of ppl to play with"
        icon="fab fa-forumbee" to="lobbies"/>
      <EssentialLink title="Community" caption="Out and about"
        icon="fa-solid fa-users" to="users" :notif="soc.getNotifCount" />
      <EssentialLink title="Inbox" caption="Your message threads"
        icon="fa-solid fa-comments" to="inbox" :notif="$thread.totalUnread"/>
      <EssentialLink title="History" caption="Match history"
        icon="fa-solid fa-chart-line" to="history" />
      <EssentialLink title="Settings" caption="Your account settings"
        icon="fa-solid fa-gear" to="settings" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import EssentialLink from 'components/EssentialLink.vue';
import FourtyTwoLogo from 'src/components/FourtyTwoLogo.vue';
import { useAuthStore } from 'src/stores/auth.store';
import { useSocialStore } from 'src/stores/social.store';
import { useThreadStore } from 'src/stores/thread.store';
import { defineComponent, ref } from 'vue';

defineComponent({
  components: {
    EssentialLink,
    FourtyTwoLogo,
  },
});

const miniState = ref(true);

const $auth = useAuthStore();
const soc = useSocialStore();
const $thread = useThreadStore();

$auth.socket.on('friendship', () => { soc.fetchRelationships(); });
$auth.socket.on('block', () => {
  console.log('received block event');
  soc.fetchRelationships();
});

$thread.fetchThreads();
// const router = useRouter();

// onMounted(() => {
//   auth.socket.on('online', ({ name, type }) => {
//     Notify.create({
//       message: `${name} just is now ${
//         type === 'connect' ? 'connected' : 'disconnected'
//       }`,
//     });
//     auth.fetchConnectedUsers();
//   });
//   auth.socket.on('message', (message) => {
//     Notify.create({
//       message: `Server say ${message}`,
//     });
//   });
//   auth.socket.on('redirect', (url) => {
//     console.log('Shoudl redirect', url, this, (this as any).router);
//     setTimeout(() => router.push(url), 2000);
//   });
// });
</script>
