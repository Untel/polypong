<template>
  <q-page padding>
    <pre>Response: {{ lobbies.getLobbies }}</pre>
    <q-card v-for="lobby of lobbies.getLobbies">
      <pre>{{ lobby }}</pre>
      <q-btn @click="lobbies.joinLobby(lobby.id)">Join lobby {{ lobby.id }}</q-btn>
    </q-card>
    <q-card>
      <q-input v-model="lobbyName"></q-input>
      <q-btn @click="lobbies.createLobby(lobbyName)">Create lobby</q-btn>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useApi } from 'src/utils/api';
import { useLobbiesStore } from 'src/stores/lobbies';
import { useAuthStore } from 'src/stores/auth';
import { ref } from 'vue';
const lobbies = useLobbiesStore();
const { socket } = useAuthStore();
lobbies.fetchLobbies();
const lobbyName = ref('');
socket?.on('refreshedLobbies', lobbies.fetchLobbies);
</script>
