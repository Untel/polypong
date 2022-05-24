<template>
  <q-page padding>
    <pre>Response: {{ lobbies.getLobbies }}</pre>
    <q-card v-for="lobby of lobbies.getLobbies">
      <pre>{{ lobby }}</pre>
    </q-card>

    <q-btn @click="lobbies.createLobby()">Create lobby</q-btn>
  </q-page>
</template>

<script lang="ts" setup>
import { useApi } from 'src/utils/api';
import { useLobbiesStore } from 'src/stores/lobbies';
import { useAuthStore } from 'src/stores/auth';
const lobbies = useLobbiesStore();
const { socket } = useAuthStore();
lobbies.fetchLobbies();

socket?.on('refreshedLobbies', lobbies.fetchLobbies);
</script>
