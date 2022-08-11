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
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect
    Id: {{ props.id }} {{ props }}
    <q-btn @click="start">Start game</q-btn>

    <section class="user-list">
      <UserCard
        v-for="player in $lobbies.getActiveLobby.players"
        :key="`player-${player.user.id}`"
        :avatar="player.user.avatar"
        :name="player.user.name"
        :caption="player.user.email"
        :color="player.color"
        :canUpdate="canUpdate"
        @change="(evt) => $lobbies.updateLobby(lobby.id, { players: { [player.user.id]: evt } })"
      >
        <q-btn v-if="!(player.user.id === $auth.user.id)">Add friend</q-btn>
      </UserCard>
      <UserCard
        v-for="(bot, index) in $lobbies.getActiveLobby.bots"
        :key="`bot-${index}`"
        :avatar="bot.avatar"
        :color="bot.color"
        :name="bot.name"
        :canUpdate="canUpdate"
        @change="(evt) => $lobbies.updateLobby(lobby.id, { bots: { [index]: evt } })"
        caption="Invite someone to replace this bot"
      >
        <q-btn>Invite</q-btn>
        <!-- :model-value="bot.level" -->
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
        <q-input
          :model-value="$lobbies.getActiveLobby.name"
          label="Lobby name"
          @change="(evt) => $lobbies.updateLobby(lobby.id, { name: evt })"
          :disable="!canUpdate"
          name="name"
          lazy-rules
          :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
        />
      </q-form>
    </section>
  </q-page>
</template>
<script lang="ts">
import { Notify } from 'quasar';
import { PreFetchOptions } from '@quasar/app-vite';
import { useLobbiesStore, Lobby } from 'src/stores/lobbies.store';

export default {
  async preFetch(ctx: PreFetchOptions<unknown>) {
    const {
      currentRoute, redirect,
    } = ctx;
    const $lobbies = useLobbiesStore();
    const id = currentRoute.params.id as string;
    try {
      await $lobbies.fetchAndJoinLobby(id);
    } catch (err) {
      Notify.create({
        type: 'negative',
        message: 'Error while joining lobby',
      });
      redirect({ name: 'lobbies' });
    }
  },
};
</script>
<script lang="ts" setup>
import {
  defineProps, computed, ref, watch, defineComponent, onMounted, onUnmounted,
} from 'vue';
import { useAuthStore } from 'src/stores/auth.store';
import UserCard from 'src/components/UserCard.vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const $lobbies = useLobbiesStore();
const $auth = useAuthStore();
const { getActiveLobby: lobby } = $lobbies;
const $route = useRoute();
const $router = useRouter();

const minPlayers = computed(() => {
  const present = $lobbies.getActiveLobby.players.length;
  if (present < 2) return 2;
  return present;
});
const start = () => {
  $lobbies.startGame(+$route.params.id);
};

const canUpdate = computed(() => {
  const can = lobby.host.id === $auth.user.id;
  return can;
});

onMounted(() => {
  const id = +($route.params.id as string);
  $auth.socket?.on('lobby_change', (evt) => {
    $lobbies.fetchCurrentLobby(id);
  });
  $auth.socket?.on('start', (evt) => {
    $router.push(`/lobby/${id}/game`);
  });
});

onUnmounted(() => {
  $auth.socket?.off('start');
  $auth.socket?.off('lobby_change');
});

const botLevels = [
  { color: 'green', label: 'easy' },
  { color: 'orange', label: 'medium' },
  { color: 'red', label: 'hard' },
];
</script>
