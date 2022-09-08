<template>
  <q-page padding>
    <h6>Response: {{ lobbies.getLobbies }}</h6>
    <q-card v-for="(lobby, idx) of lobbies.getLobbies" v-bind:key=idx>
      <h6>{{ lobby }}</h6>
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
