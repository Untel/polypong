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
      <EssentialLink title="Home" caption="Sweet home" icon="fas fa-igloo" to="home"/>
      <EssentialLink title="Login" caption="Login" icon="fab fa-connectdevelop" to="login"/>
      <EssentialLink title="Coalitions" caption="Mine's better"
        icon="fas fa-group-arrows-rotate" to="coalitions"/>
      <EssentialLink title="Lobbies" caption="Game on !"
        icon="fab fa-forumbee" to="lobbies"/>
      <EssentialLink title="Community" caption="Out and about"
        icon="fa-solid fa-users" to="users" :notif="soc.getNotifCount" />
      <EssentialLink title="Inbox" caption="bla bla"
        icon="fa-solid fa-comments" to="inbox" :notif="$thread.totalUnread"/>
      <EssentialLink title="Profile" caption="Stats, check em"
        icon="fa-solid fa-chart-line" to="profile" />
      <EssentialLink title="Settings" caption="Account settings"
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
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useSocialStore } from 'src/stores/social.store';
import { useThreadStore } from 'src/stores/thread.store';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

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
const $lobbies = useLobbiesStore();
const router = useRouter();

$auth.socket.on('friendship', () => { soc.fetchRelationships(); });
$auth.socket.on('block', () => {
  // console.log('received block event');
  soc.fetchRelationships();
});

$thread.fetchThreads();

$auth.socket.on('lobbyInvite', (fromId: number, fromName: string, lobbyId: number) => {
  $lobbies.invitedBy(fromId, fromName, lobbyId);
});
$auth.socket.on('lobbyKick', async (fromId: number, fromName: string, lobbyId: number) => {
  // console.log(`KICKED : ${fromName} has been kicked from the lobby ${lobbyId}`);
  if (fromId === $auth.user.id) {
    $lobbies.activeLobby = null;
    router.push('/lobbies');
  }
  if ($lobbies.getActiveLobby) {
    await $lobbies.fetchCurrentLobby($lobbies.getActiveLobby.id);
  }
});
$auth.socket.on('lobbyLeaver', async (fromId: number, fromName: string, lobbyId: number) => {
  // console.log(`LEAVER : ${fromName} has left the lobby ${lobbyId}`);
  if ($lobbies.getActiveLobby) {
    await $lobbies.fetchCurrentLobby($lobbies.getActiveLobby.id);
  }
});
$auth.socket.on('lobbyDeleted', async (lobbyId: number) => {
  // console.log(`LOBBYDELETED : ${lobbyId} has been deleted`);
  await $lobbies.fetchLobbies();
});
$auth.socket.on('lobbyCreated', async (lobbyId: number) => {
  // console.log(`LOBBYCREATED : ${lobbyId} has been created`);
  await $lobbies.fetchLobbies();
});
$auth.socket.on('lobbyNewHost', async (lobbyId: number) => {
  // console.log(`LOBBYNEWHOST : ${lobbyId} has a new host`);
  if ($lobbies.getActiveLobby) {
    await $lobbies.fetchCurrentLobby($lobbies.getActiveLobby.id);
  }
});

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
