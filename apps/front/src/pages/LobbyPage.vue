<style>
  .user-list {
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
    Here we should config the lobby page and wait for peoples to connect
    Id: {{ props.id }} {{ props }}
    <q-btn @click="start">Start game</q-btn>

    <section class="user-list">
      <UserCard
        v-for="player in $lobbies.getActiveLobby.players"
        :key="`player-${player.user.id}`"
        :avatar="player.user.avatar"
        :name="player.user.name"
        :caption="player.user.email"
        :color="player.color"
      >
        <q-btn v-if="!(player.user.id === $auth.user.id)">Add friend</q-btn>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color v-model="player.color" />
          </q-popup-proxy>
        </q-icon>
      </UserCard>
      <UserCard
        v-for="slotNum in missingPlayers"
        :key="`slot-${slotNum}`"
        avatar="https://pbs.twimg.com/media/D9b5gbcWkAUrKAc.jpg"
        :name="`Beep Beep Robot n°${slotNum}`"
        caption="Invite someone to replace this bot"
      >
        <q-btn>Invite</q-btn>
      </UserCard>
    </section>

    <section>
      <q-form
        ref="lobbyForm"
        @validationSuccess="onFormChange"
        >
        <q-field
          label="Players max">
          <q-slider
            :disable="!canUpdate"
            name="playersMax"
            :model-value="$lobbies.activeLobby?.playersMax"
            @change="(evt) => $lobbies.updateLobby(lobby.id, { playersMax: evt })"
            :min="$lobbies.getActiveLobby.players.length > 2 && lobby.players.length || 2"
            :max="16"
            snap
            markers
            label-always
            label
          />
        </q-field>
        <q-input
          :model-value="$lobbies.getActiveLobby.name"
          label="Lobby name"
          @change="(evt) => $lobbies.updateLobby(lobby.id, { name: evt })"
          :disable="!canUpdate"
          name="name"
          lazy-rules
          :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
        />
      <!-- <q-btn color="primary" type="submit" label="Validate" /> -->
      </q-form>
    </section>
    <section>
      <pre>
        {{ lobby }}
      </pre>
    </section>
  </q-page>
</template>

<script lang="ts">
import { Notify } from 'quasar';
import { PreFetchOptions } from '@quasar/app-vite';
import { useAuthStore } from 'src/stores/auth.store';
import { useLobbiesStore, Lobby } from 'src/stores/lobbies.store';

export default {
  async preFetch(ctx: PreFetchOptions<unknown>) {
    const {
      currentRoute, redirect,
    } = ctx;
    const $lobbies = useLobbiesStore();
    const id = currentRoute.params.id as string;
    try {
      await $lobbies.fetchAndJoinLobby(id);
    } catch (err) {
      Notify.create({
        type: 'negative',
        message: 'Error while joining lobby',
      });
      redirect({ name: 'lobbies' });
    }
  },
};
</script>
<script lang="ts" setup>
import {
  defineProps, computed, ref, watch, defineComponent, onMounted,
} from 'vue';
import UserCard from 'src/components/UserCard.vue';
import { useRoute } from 'vue-router';

defineComponent({
  components: {
    UserCard,
  },
});
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const $lobbies = useLobbiesStore();
const $auth = useAuthStore();
const { getActiveLobby: lobby } = $lobbies;
const $route = useRoute();

const lobbyForm = ref();

const start = () => {
  // props.lobbyId =
  // lobby.resolve()
};

const canUpdate = computed(() => {
  const can = lobby.host.user.id === $auth.user.id;
  return can;
});

const onFormChange = (evt) => {
  // $lobbies.up
};

onMounted(() => {
  const id = +($route.params.id as string);
  $auth.socket?.on('lobby_change', (evt) => {
    $lobbies.fetchCurrentLobby(id);
  });
});

const missingPlayers = computed(() => (
  ($lobbies.getActiveLobby.playersMax || 0) - ($lobbies.getActiveLobby.players.length || 0)
));
</script>
