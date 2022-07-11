<style>
  .card-grid {
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
    <!-- <pre>Response: {{ lobbies.getLobbies }}</pre> -->
    <div class="card-grid">
      <LobbyCard
        :id="0"
        name="MatchMaking"
        subhead="Found the regular opponent"
        avatar="/matchmaking.png"
      >
        <q-circular-progress
          show-value
          class="text-light-blue q-ma-md"
          :value="3"
          indeterminate
          size="50px"
          color="light-blue"
        /> Searching players
      </LobbyCard>
      <LobbyCard
        :id="-1"
        name="Create"
        subhead="Create a new lobby"
        join-text="Create"
        @joinLobby="lobbies.createLobby(lobbyName)"
      >
        <q-input label="Lobby name" dense filled v-model="lobbyName"/>
        <q-toggle label="Private" v-model="isPrivate" />
        <PasswordInput v-if="isPrivate" label="Password?" dense filled v-model="password"/>
      </LobbyCard>
      <LobbyCard
        v-for="lobby of lobbies.getLobbies"
        :name="lobby.name || 'Unamed lobby'"
        :subhead="lobby.description || ''"
        :avatar="lobby.host.avatar"
        :is-private="lobby.isPrivate"
      >
        <q-circular-progress
          show-value
          class="text-light-blue q-ma-md"
          :value="lobby.players.length || 6"
          :max="lobby.playersMax"
          size="50px"
          color="light-blue"
        >
          {{ lobby.players.length || 6 }}/{{lobby.playersMax}}
        </q-circular-progress>
        Players
      </LobbyCard>

    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useApi } from 'src/utils/api';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useAuthStore } from 'src/stores/auth.store';
import LobbyCard from 'src/components/LobbyCard.vue';
import PasswordInput from "src/components/PasswordInput.vue"

import { ref } from 'vue';
const lobbies = useLobbiesStore();
const { socket } = useAuthStore();
lobbies.fetchLobbies();
const lobbyName = ref('');
const password = ref('');
const isPrivate = ref(false);
socket?.on('refreshedLobbies', lobbies.fetchLobbies);
</script>
