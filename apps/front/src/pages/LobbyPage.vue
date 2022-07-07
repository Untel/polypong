<template>
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect
    <q-linear-progress v-model="isFetching" indeterminate></q-linear-progress>
    <pre>
      {{ isFetching }}
      {{ data }}
    </pre>
    <q-btn @click="start">Start game</q-btn>
  </q-page>
</template>

<script lang="ts" setup>

import { defineProps, computed } from 'vue';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useApi } from 'src/utils/api';

const props = defineProps({
  lobbyId: {
    type: String,
    required: true,
  },
});

const { data, error, isFetching } = useApi(`pong/lobby/${props.lobbyId}`);

const lobbies = useLobbiesStore();
lobbies.joinLobby(+props.lobbyId);

const start = () => {
  // props.lobbyId =
  // lobby.resolve()
}

const missingPlayers = computed(() => {
  // return (lobby.playerMax - Object.values(lobby.spectateur))
})
</script>
