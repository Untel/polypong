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
        v-for="player in lobby.players"
        :key="`player-${player.user.id}`"
        :avatar="player.user.avatar"
        :name="player.user.name"
        :caption="player.user.email"
      >
        <q-btn>Add friend</q-btn>
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
        <q-slider
          :disable="!canUpdate"
          name="playersMax"
          v-model="lobby.playersMax"
          :min="2"
          :max="16"
          snap
          vertical
          reverse
          markers
          label-always
          label
        />
        <q-input v-model="lobby.name" label="Lobby name"
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
      const response = await $lobbies.fetchAndJoinLobby(id);
      $lobbies.activeLobby = response;
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
  defineProps, computed, ref, watch, defineComponent,
} from 'vue';
import UserCard from 'src/components/UserCard.vue';

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
const lobby = $lobbies.getActiveLobby as Lobby;

const lobbyForm = ref();

const start = () => {
  // props.lobbyId =
  // lobby.resolve()
};

watch(lobby, (newVal, oldVal) => {
  $lobbies.updateLobby(newVal.id, newVal);
});

const canUpdate = computed(() => {
  const can = lobby.host.user.id === $auth.user.id;
  return can;
});

const onFormChange = (evt) => {
  // $lobbies.up
};

const missingPlayers = computed(() => (lobby && (lobby.playersMax - lobby.players.length)));
</script>
