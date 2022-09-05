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
import { usePageLeave } from '@vueuse/core';
import EssentialLink from 'components/EssentialLink.vue';
import FourtyTwoLogo from 'src/components/FourtyTwoLogo.vue';
import { useAuthStore } from 'src/stores/auth.store';
import { lobbiesApi, useLobbiesStore } from 'src/stores/lobbies.store';
import { useSocialStore } from 'src/stores/social.store';
import { useThreadStore } from 'src/stores/thread.store';
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
const router = useRouter(); const route = useRoute();

$auth.socket.on('friendship', () => { soc.fetchRelationships(); });
$auth.socket.on('block', () => {
  // console.log('received block event');
  soc.fetchRelationships();
});

$thread.fetchThreads();

function isActiveIn(lobbyId: number): boolean {
  if ($lobbies.activeLobby) {
    if ($lobbies.activeLobby.id === lobbyId) return true;
  }
  return false;
}

$auth.socket.on('lobbyInvite', (fromId: number, fromName: string, lobbyId: number) => {
  $lobbies.invitedBy(fromId, fromName, lobbyId);
});

$auth.socket.on('lobbyKick', async (fromId: number, fromName: string, lobbyId: number) => {
//  console.log(`KICKED : ${fromName} has been kicked from the lobby ${lobbyId}`);
  if ($lobbies.activeLobby) {
    if ($lobbies.activeLobby.id === lobbyId) {
      if ($auth.user.id === fromId) {
        $lobbies.activeLobby = null;
        router.push('/lobbies');
      } else {
        await $lobbies.fetchCurrentLobby($lobbies.activeLobby.id);
      }
    }
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyLeaver', async (fromId: number, fromName: string, lobbyId: number) => {
//  console.log(`LEAVER : ${fromName} has left the lobby ${lobbyId}`);
  if (isActiveIn(lobbyId)) {
    if ($auth.user.id === fromId) {
      $lobbies.activeLobby = null;
    }
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('userJoinedLobby', async (userId: number, lobbyId: number) => {
//  console.log(`USERJOIN : ${userId} has joined the lobby ${lobbyId}`);
  if (isActiveIn(lobbyId)) {
    $lobbies.fetchCurrentLobby(lobbyId);
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyDeleted', async (lobbyId: number) => {
//  console.log(`LOBBYDELETED : ${lobbyId} has been deleted`);
  if (isActiveIn(lobbyId)) {
    $lobbies.activeLobby = null;
    if (window.location.pathname === `/lobby/${lobbyId}`) {
      router.push('/lobbies');
    }
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyCreated', async (lobbyId: number, Nplayers: number) => {
//  console.log(`LOBBYCREATED : ${lobbyId} has been created, it has ${Nplayers} players`);
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyNewHost', async (lobbyId: number) => {
//  console.log(`LOBBYNEWHOST : ${lobbyId} has a new host`);
  if (isActiveIn(lobbyId)) {
    await $lobbies.fetchCurrentLobby($lobbies.getActiveLobby.id);
  }
});

$auth.socket.on('gameOver', async (lobbyId: number) => {
//  console.log(`GAMEOVER : ${lobbyId} has been closed`);
  try {
    await $lobbies.leave();
  } catch (e) {
    //    console.log(e);
  }
  router.push('/lobbies');
  $lobbies.activeLobby = null;
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('other_game_over', async (lobbyId: number) => {
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('start', async (lobbyId: number) => {
//  console.log(`GAMESTART : your game in ${lobbyId} has started`);
  if (isActiveIn(lobbyId)) {
    router.push(`/lobby/${lobbyId}/game`);
  }
});

$auth.socket.on('game_start', async (lobbyId: number) => {
//  console.log(`OTHER GAMESTART : ${lobbyId} has started`);
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobby_change', async (lobbyId: number) => {
//  console.log('LOBBY_CHANGE - lobbyId = ', lobbyId);
  await $lobbies.fetchLobbies();
  if (isActiveIn(lobbyId)) {
    await $lobbies.fetchCurrentLobby(lobbyId);
  }
  await $auth.fetchConnectedUsers();
});

// $auth.socket.onAny((eventName, ...args) => {
//  console.log('EMIT - ', eventName, ', ARGS :', ...args);
// });

// onMounted(async () => {
//   const id = +($route.params.id as string);
//   $auth.socket.on('start', (lobbyId: number) => {
//     console.log(`GAMESTART : ${lobbyId} has started`);
//     $router.push(`/lobby/${id}/game`);
//   });
//   $auth.socket.on('lobby_change', async (evt) => {
//     $lobbies.fetchLobbies();
//   });
// });

// onUnmounted(() => {
//   $auth.socket.off('start');
//   $auth.socket.off('lobby_change');
// });

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
