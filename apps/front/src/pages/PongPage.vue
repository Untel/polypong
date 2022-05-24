<template>
  <q-page padding>
    <q-linear-progress v-if="fetchingLobbies" indeterminate />
    <pre>Response: {{ getLobbies }}</pre>
    <q-card v-for="lobby in getLobbies">
      <pre>{{ lobby }}</pre>
    </q-card>

    <q-btn @click="createLobby()">Create lobby</q-btn>
  </q-page>
</template>

<script lang="ts" setup>
import { useApi } from 'src/utils/api';
import { useLobbiesStore } from 'src/stores/lobbies';
import { useAuthStore } from 'src/stores/auth';
const { createLobby, fetchLobbies, fetchingLobbies, getLobbies } = useLobbiesStore();
const { socket } = useAuthStore();
fetchLobbies();
socket?.on('refreshedLobbies', () => fetchLobbies());
</script>
