<template>
  <q-layout full-height view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img :src="$auth.user.avatar" alt="">
        </q-avatar>
        <q-toolbar-title>
          {{ $auth.user.name }}
        </q-toolbar-title>
        <q-btn v-if="$lobbies.activeLobby" color="purple"
          @click="() => {router.push(`/lobby/${$lobbies.activeLobby?.id}`)}"
        >
          CURRENT LOBBY <!--{{$lobbies.getActiveLobby?.id}}-->
        </q-btn>
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
      <div class="logo-place">
        <FourtyTwoLogo :size="miniState && '2rem' || '5rem'" />
      </div>
      <EssentialLink title="Home" caption="Sweet home" icon="fas fa-igloo" to="home"/>
      <EssentialLink title="Login" caption="Login" icon="fab fa-connectdevelop" to="login"/>
      <!--
      <EssentialLink title="Coalitions" caption="Mine's better"
        icon="fas fa-group-arrows-rotate" to="coalitions"/>
      -->
      <EssentialLink title="Lobbies" caption="Game on !"
        icon="fab fa-forumbee" to="lobbies"/>
      <EssentialLink title="Community" caption="Out and about"
        icon="fa-solid fa-users" to="users" :notif="soc.getNotifCount" />
      <EssentialLink title="Inbox" caption="bla bla"
        icon="fa-solid fa-comments" to="channels" :notif="$thread.totalUnread"/>
      <EssentialLink title="Profile" caption="Stats, check em"
        icon="fa-solid fa-chart-line" to="profile" />
      <EssentialLink title="Settings" caption="Account settings"
        icon="fa-solid fa-gear" to="settings" />
    </q-drawer>

    <q-page-container full-height :class="['bg-triangle', $auth.user.coalition]">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
  .logo-place {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  .bg-triangle {
    min-height: inherit;
    background-size: cover;
  }
  .alliance {
    background-image: url('/src/assets/alliance_background.jpg');
  }
  .federation {
    background-image: url('/src/assets/federation_background.jpg');
  }
  .assembly {
    background-image: url('/src/assets/assembly_background.jpg');
  }
  .order {
    background-image: url('/src/assets/order_background.jpg');
  }
</style>

<script lang="ts" setup>
import { usePageLeave } from '@vueuse/core';
import EssentialLink from 'components/EssentialLink.vue';
import FourtyTwoLogo from 'src/components/FourtyTwoLogo.vue';
import { useAuthStore } from 'src/stores/auth.store';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useSocialStore } from 'src/stores/social.store';
import { useThreadStore } from 'src/stores/thread.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import FssFallback from 'src/components/FssFallback.vue';
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
const $his = useMatchHistoryStore();
const router = useRouter(); const route = useRoute();

$auth.socket.on('friendship', () => { soc.fetchRelationships(); });
$auth.socket.on('block', () => {
  // console.log('received block event');
  soc.fetchRelationships();
});

$thread.fetchThreads();

async function isActiveIn(lobbyId: number): boolean {
  await $lobbies.fetchLobbies();
  // eslint-disable-next-line max-len
  // console.log('isActiveIn - lobbyId = ', lobbyId, 'activelobby?.id :', $lobbies.getActiveLobby?.id);
  if ($lobbies.getActiveLobby) {
    if ($lobbies.getActiveLobby.id === lobbyId) return true;
  }
  return false;
}

$auth.socket.on('lobbyInvite', (fromId: number, fromName: string, lobbyId: number) => {
  $lobbies.invitedBy(fromId, fromName, lobbyId);
});

$auth.socket.on('lobbyKick', async (fromId: number, fromName: string, lobbyId: number) => {
//  console.log(`KICKED : ${fromName} has been kicked from the lobby ${lobbyId}`);
  if ($lobbies.getActiveLobby) {
    if ($lobbies.getActiveLobby.id === lobbyId) {
      if ($auth.user.id === fromId) {
        $lobbies.activeLobby = null;
        router.push('/lobbies');
      } else {
        await $lobbies.fetchCurrentLobby($lobbies.getActiveLobby.id);
      }
    }
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyLeaver', async (fromId: number, fromName: string, lobbyId: number) => {
  // console.log(`LEAVER : ${fromName} has left the lobby ${lobbyId}`);
  if (await isActiveIn(lobbyId)) {
    if ($auth.user.id === fromId) {
      $lobbies.activeLobby = null;
    }
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('userJoinedLobby', async (userId: number, lobbyId: number) => {
  console.log(`USERJOIN : ${userId} has joined the lobby ${lobbyId}`);
  if (await isActiveIn(lobbyId)) {
    // console.log('HAHA');
    try { $lobbies.fetchCurrentLobby(lobbyId); } catch (e) { /* e */ }
  }
  try { await $lobbies.fetchLobbies(); } catch (e) { /* e */ }
  try { await $auth.fetchConnectedUsers(); } catch (e) { /* e */ }
});

$auth.socket.on('madeMatch', () => {
  $lobbies.madeMatches += 1;
  // console.log(`Updated ! ${$lobbies.madeMatches}`);
});

$auth.socket.on('lobbyDeleted', async (lobbyId: number) => {
  // console.log(`LOBBYDELETED : ${lobbyId} has been deleted`);
  if (await isActiveIn(lobbyId)) {
    $lobbies.activeLobby = null;
    if (window.location.pathname === `/lobby/${lobbyId}`) {
      router.push('/lobbies');
    }
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyCreated', async (lobbyId: number, Nplayers: number) => {
  // console.log(`LOBBYCREATED : ${lobbyId} has been created, it has ${Nplayers} players`);
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobbyNewHost', async (lobbyId: number) => {
  // console.log(`LOBBYNEWHOST : ${lobbyId} has a new host`);
  if (await isActiveIn(lobbyId)) {
    await $lobbies.fetchCurrentLobby($lobbies.getActiveLobby.id);
  }
});

$auth.socket.on('gameOver', async (lobbyId: number) => {
  // console.log(`GAMEOVER : ${lobbyId} has been closed`);
  const curId = $lobbies.getActiveLobby?.id;
  $lobbies.activeLobby = null;
  if (curId === lobbyId) {
    await $his.fetchUserMatchesHistory();
    const matches = $his.getUserMatchesHistory($auth.user.id)?.matches;
    if (matches) {
      // console.log('matches = ', matches);
      const matchId = matches[0]?.id;
      // console.log('matchId = ', matchId);
      router.push(`/profile?matchId=${matchId}`);
    } else {
      router.push('/profile');
    }
    $his.fetchUserMatchesHistory($auth.user.id);
  } else {
    router.push('/lobbies');
  }
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('other_game_over', async (lobbyId: number) => {
  await $lobbies.fetchLobbies();
  await $auth.fetchConnectedUsers();
});

$auth.socket.on('start', async (lobbyId: number) => {
  // console.log(`GAMESTART : your game in ${lobbyId} has started`);
  if (await isActiveIn(lobbyId)) {
    router.push(`/lobby/${lobbyId}/game`);
  }
});

$auth.socket.on('game_start', async (lobbyId: number) => {
  // console.log(`OTHER GAMESTART : ${lobbyId} has started`);
  await $lobbies.fetchLobbies(); await $auth.fetchConnectedUsers();
});

$auth.socket.on('lobby_change', async (lobbyId: number) => {
  // console.log('LOBBY_CHANGE - lobbyId = ', lobbyId);
  await $lobbies.fetchLobbies();
  if (await isActiveIn(lobbyId)) {
    await $lobbies.fetchCurrentLobby(lobbyId);
  }
  await $auth.fetchConnectedUsers();
});

</script>
