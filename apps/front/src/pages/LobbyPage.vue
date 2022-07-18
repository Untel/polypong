<template>
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect
    Id: {{ props.id }} {{ props }}
    <q-btn @click="start">Start game</q-btn>

    <section>
      <q-form
        ref="lobbyForm"
        @validationSuccess="onFormChange"
        >
        <q-slider
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
          name="name"
          lazy-rules
          :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
        />
      <!-- <q-btn color="primary" type="submit" label="Validate" /> -->
      </q-form>
    </section>
    <section>
    </section>
  </q-page>
</template>

<script lang="ts">
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth.store';

export default {
  async preFetch(ctx: PreFetchOptions<any>) {
    const { store, currentRoute, previousRoute, redirect, urlPath, publicPath } = ctx;
    const $lobbies = useLobbiesStore();
    const $auth = useAuthStore();
    const id = currentRoute.params['id'] as string;
    try {
      const response = await $lobbies.fetchAndJoinLobby(id);
      $lobbies.activeLobby = response;
    } catch(err) {
      Notify.create({
        type: 'negative',
        message: 'Error while joining lobby',
      });
      return redirect({ name: 'lobbies' });
    }
  },
}
</script>
<script lang="ts" setup>
import { defineProps, computed, ref, reactive, watch, onMounted } from 'vue';
import { Lobby } from 'src/stores/lobbies.store';
import { PreFetchOptions } from '@quasar/app-vite';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const $lobbies = useLobbiesStore();
const lobby = $lobbies.getActiveLobby as Lobby;

const lobbyForm = ref();

const start = () => {
  // props.lobbyId =
  // lobby.resolve()
};

const onFormChange = (evt) => {
  // $lobbies.up
};

const missingPlayers = computed(() => {
  // return (lobby.playerMax - Object.values(lobby.spectateur))
})
</script>
