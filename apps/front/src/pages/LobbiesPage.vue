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
        subhead="Find the regular opponent"
        avatar="/matchmaking.png"
      >
        <q-circular-progress
          show-value
          class="text-primary q-ma-md"
          :value="3"
          indeterminate
          size="50px"
          color="primary"
        /> Searching players
      </LobbyCard>
      <LobbyCard
        :id="-1"
        name="Create"
        subhead="Create a new lobby"
        joinText="Create"
        @joinLobby="createLobby"
      >
        <q-input label="Lobby name" dense filled v-model="lobbyName"/>
        <q-toggle label="Private" v-model="isPrivate" />
        <PasswordInput v-if="isPrivate" label="Password?" dense filled v-model="password"/>
      </LobbyCard>
      <LobbyCard
        v-for="lobby of lobbies.getLobbies"
        :key="`lobby-${lobby.id}`"
        :name="lobby.name || 'Unamed lobby'"
        :subhead="`${lobby.host.name}'s party`"
        :avatar="lobby.host.avatar"
        :is-private="lobby.isPrivate"
        :join-text="lobby.isStarted ? 'Spectate' : 'Join'"
        @joinLobby="router.push({ name: 'lobby', params: { id: lobby.id } })"
      >
        <q-circular-progress
          show-value
          :indeterminate="!!lobby.isStarted"
          class="text-light-blue q-ma-md"
          :value="lobby.isStarted || lobby.players.length"
          :max="lobby.playersMax"
          size="50px"
          :color="lobby.isStarted ? 'accent' : 'primary'"
        >
          <span v-if="lobby.isStarted">{{ lobby.isStarted }}/{{ lobby.playersMax }}</span>
          <span v-else>{{ lobby.players.length }}/{{lobby.playersMax}}</span>
        </q-circular-progress>
      </LobbyCard>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useApi } from 'src/utils/api';
import { useLobbiesStore, Lobby } from 'src/stores/lobbies.store';
import { useAuthStore } from 'src/stores/auth.store';
import LobbyCard from 'src/components/LobbyCard.vue';
import PasswordInput from 'src/components/PasswordInput.vue';
import { useRouter, useRoute } from 'vue-router';
import {
  onMounted,
  onBeforeUnmount,
  ref,
  defineComponent,
} from 'vue';

defineComponent({
  components: {
    LobbyCard,
    PasswordInput,
  },
});

const lobbies = useLobbiesStore();
const { socket } = useAuthStore();
lobbies.fetchLobbies();
const lobbyName = ref('');
const password = ref('');
const isPrivate = ref(false);
const router = useRouter();

async function createLobby() {
  const newLobby = await lobbies.createLobby(lobbyName.value);
  if (newLobby) {
    console.log('New lobby is', newLobby, newLobby.id);
    router.push({ name: 'lobby', params: { id: newLobby.id } });
  } else {
    console.log('Error lulz');
  }
}

onMounted(() => {
  socket?.on('refreshedLobbies', lobbies.fetchLobbies);
});

onBeforeUnmount(() => {
  socket?.off('refreshedLobbies', (args) => {
    console.log('Removing listeners', args);
  });
});

</script>
