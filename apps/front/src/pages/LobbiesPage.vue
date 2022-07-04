<template>
  <q-page padding>
    <pre>Response: {{ lobbies.getLobbies }}</pre>
    <div class="q-pa-md row items-start q-gutter-md">
      <LobbyCard name="MatchMacking" />
      <LobbyCard
        v-for="lobby of lobbies.getLobbies"
        :name="lobby.name"
      />
      <LobbyCard
        name="Create"
        join-text="Create"
        @joinLobby="lobbies.createLobby(lobbyName)"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useApi } from 'src/utils/api';
import { useLobbiesStore } from 'src/stores/lobbies';
import { useAuthStore } from 'src/stores/auth.store';
import LobbyCard from 'src/components/LobbyCard.vue';
import { ref } from 'vue';
const lobbies = useLobbiesStore();
const { socket } = useAuthStore();
lobbies.fetchLobbies();
const lobbyName = ref('');
socket?.on('refreshedLobbies', lobbies.fetchLobbies);
</script>
