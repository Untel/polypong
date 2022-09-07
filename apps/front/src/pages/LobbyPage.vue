<style>
  .user-list {
    display: grid;
    /* grid-auto-flow: column; */
    grid-template-columns: repeat(2, minmax(200px, 1fr));
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px
  }
</style>

<template>
<pre>
  host : {{ $lobbies.getActiveLobby?.host.name }}
  lobbyId : {{ $lobbies.getActiveLobby?.id }}
</pre>
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect
    Id: {{ props.id }} {{ props }}
    <q-card-section>
      <q-btn
        @click="$lobbies.startGame(+$route.params.id);"
        class="full-width" outline bordered color="primary"
      >
        Start game
      </q-btn>
    </q-card-section>

    <section>
      <q-form ref="lobbyForm">
        <q-field
          label="Players max">
          <q-slider
            :disable="!canUpdate"
            name="playersMax"
            :model-value="$lobbies.activeLobby?.playersMax"
            @change="(evt) => $lobbies.updateLobby(lobby.id, { playersMax: evt })"
            :min="minPlayers"
            :max="16"
            snap
            markers
            label-always
            label
          />
        </q-field>
        <q-field
          label="Points to win (1v1)">
          <q-slider
            :disable="!canUpdate"
            name="finalePoints"
            :model-value="$lobbies.activeLobby?.finalePoints"
            @change="(evt) => $lobbies.updateLobby(lobby.id, { finalePoints: evt })"
            :min="2"
            :max="11"
            snap
            markers
            label-always
            label
          />
        </q-field>
        <q-input
          :model-value="$lobbies.getActiveLobby?.name"
          label="Lobby name"
          @change="(evt) => $lobbies.updateLobby(
            $lobbies.getActiveLobby.id, { name: evt }
          )"
          :disable="!canUpdate"
          name="name"
          lazy-rules
          :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
        />
      </q-form>
    </section>

    <section v-if="rel" class="row justify-center">
      <!-- SEARCH RESULTS -->
      <social-card :relname="rel.to.name"
        @message="(id) => message(id)"
        @stats="(id) => stats(id)"
        @add-friend="(name) => addFriend(name)"
        @unfriend="(name) => unfriend(name)"
        @block="(name) => block(name)"
        @unblock="(name) => unblock(name)"
      />
    </section>

    <!--<section class="user-list">-->
    <section class="row justify-center">
      <UserCard class="col-md-6"
        v-for="player in $lobbies.getActiveLobby?.players"
        :key="`player-${player.user.id}`"
        :avatar="player.user.avatar"
        :name="player.user.name"
        :caption="player.user.email"
        :color="player.color"
        :canUpdate="canUpdate"
        :isHost="player.user.id === $lobbies.getActiveLobby.host.id"
        @change="(evt) => $lobbies.updateLobby(lobby.id, { players: { [player.user.id]: evt } })"
        @avatarClick="(name) => {
          clickedUserName = clickedUserName === name ? '' : name
        }"
      >
        <template #exit>
            <!-- leave lobby -->
            <q-btn
              v-if="player.user.id === $auth.user.id"
              round icon="fa-solid fa-xmark" size="s"
              @click="async () => $lobbies.leave()"
            />
            <!-- kick player (host only)-->
            <q-btn
              v-if="player.user.id !== $auth.user.id && lobby.host.id === $auth.user.id"
              round icon="fa-solid fa-xmark" size="s"
              @click="async () => $lobbies.kick(lobby.id, player.user.id)"
            />
        </template>
      </UserCard>
      <UserCard class="col-md-6"
        v-for="(bot, index) in $lobbies.getActiveLobby?.bots"
        :key="`bot-${index}`"
        :avatar="bot.avatar"
        :color="bot.color"
        :name="bot.name"
        :canUpdate="canUpdate"
        @change="(evt) => $lobbies.updateLobby(lobby.id, { bots: { [index]: evt } })"
        caption="Invite someone to replace this bot"
      >
        <!--
        <q-btn>Invite</q-btn>
        :model-value="bot.level"
        -->
        <q-slider
          :disable="!canUpdate"
          v-model="bot.level"
          @change="(evt) => $lobbies.updateLobby(lobby.id, { bots: { [index]: { level: evt } } })"
          name="strength"
          :min="0"
          :max="2"
          :color="botLevels[bot.level || 0].color"
          track-color="green"
          selection-color="red"
          markers
          label-always
          :label-value="botLevels[bot.level || 0].label"
          label
        />
      </UserCard>
    </section>

  </q-page>
</template>
<script lang="ts">
import { PreFetchOptions } from '@quasar/app-vite';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useSocialStore } from 'src/stores/social.store';
import { asyncComputed } from '@vueuse/core';

export default {
  async preFetch(ctx: PreFetchOptions<unknown>) {
    const {
      currentRoute, redirect,
    } = ctx;
    const $lobbies = useLobbiesStore();
    const id = currentRoute.params.id as string;
    try {
      await $lobbies.fetchAndJoinLobby(id);
    } catch (_e) {
      redirect({ name: 'lobbies' });
    }
  },
};
</script>

<script lang="ts" setup>
import {
  defineProps, computed, ref, onMounted, onUnmounted,
} from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import UserCard from 'src/components/UserCard.vue';
import { useRoute, useRouter } from 'vue-router';
import SocialCard from 'src/components/SocialCard.vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const $lobbies = useLobbiesStore(); const $auth = useAuthStore();
const { getActiveLobby: lobby } = $lobbies;
const $route = useRoute(); const $router = useRouter();
const $soc = useSocialStore(); $soc.fetchRelationships();

const minPlayers = computed(() => {
  const present = $lobbies.getActiveLobby?.players.length;
  if (present < 2) return 2;
  return present;
});

const canUpdate = computed(() => {
  if ($lobbies.activeLobby) {
    if ($lobbies.activeLobby.host.id === $auth.user.id) return true;
  }
  return false;
});

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

// $auth.socket.on('start', async (lobbyId: number) => {
//  console.log(`GAMESTART : ${lobbyId} has started`);
//  if ($lobbies.activeLobby?.id === lobbyId) {
//    router.push(`/lobby/${lobbyId}/game`);
//  } else {
//    await $lobbies.fetchAndJoinLobby(lobbyId);
//    router.push(`/lobby/${lobbyId}/game`);
//  }
// });

// onUnmounted(() => {
//   $auth.socket.off('start');
//   $auth.socket.off('lobby_change');
// });

const botLevels = [
  { color: 'green', label: 'easy' },
  { color: 'orange', label: 'medium' },
  { color: 'red', label: 'hard' },
];

const clickedUserName = ref('');
const rel = asyncComputed(async () => {
  if (!clickedUserName.value) return null;
  if (clickedUserName.value === $auth.user.name) return null;
  const ret = $soc.getRelByName(clickedUserName.value);
  if (ret) return ret;
  await $soc.addRel(clickedUserName.value);
  return $soc.getRelByName(clickedUserName.value);
});

async function message(id: number) {
  $router.push(`/chat/${id}`);
}
async function stats(id: number) {
  $router.push(`/profile/${id}`);
}
async function addFriend(name: string) { await $soc.send_friendship(name); }
async function unfriend(name: string) { await $soc.unsend_friendship(name); }
async function block(name: string) { await $soc.send_block(name); }
async function unblock(name: string) { await $soc.unsend_block(name); }

// function isHost(id: number): boolean {
//  if (!id) return false;
//  return $lobbies.getActiveLobby?.host.id === id;
// }
</script>
