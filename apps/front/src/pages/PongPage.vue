<template>
  <q-page padding>
    <pre>Response: {{ lobbies.getLobbies }}</pre>
    <q-card v-for="(lobby, idx) of lobbies.getLobbies" v-bind:key=idx>
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
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';

const lobbies = useLobbiesStore();
lobbies.fetchLobbies();
const lobbyName = ref('');
const { socket } = useAuthStore();
socket.on('refreshedLobbies', lobbies.fetchLobbies);
</script>
