<template>
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect
    Id: {{ props.id }} {{ props }}
    <q-btn @click="start">Start game</q-btn>
    {{ lobby }}
  </q-page>
</template>

<script lang="ts" setup>

import { defineProps, computed } from 'vue';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useApi } from 'src/utils/api';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const lobbies = useLobbiesStore();

const lobby = lobbies.fetchAndJoinLobby(props.id);
// lobbies.joinLobby(+props.lobbyId);

const start = () => {
  // props.lobbyId =
  // lobby.resolve()
}

const missingPlayers = computed(() => {
  // return (lobby.playerMax - Object.values(lobby.spectateur))
})
</script>
