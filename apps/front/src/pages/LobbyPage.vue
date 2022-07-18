<template>
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect
    Id: {{ props.id }} {{ props }}
    <q-btn @click="start">Start game</q-btn>
    {{ lobby }}

  <section>
    <q-form
      ref="lobbyForm"
      @validationSuccess="onFormChange"
      >
      <q-slider
        name="playersMax"
        v-model="lobbyValues.playersMax"
        :min="2"
        :max="16"
        snap
        vertical
        reverse
        markers
        label-always
        label
      />
      <q-input v-model="lobbyValues.name" label="Lobby name"
        name="name"
        lazy-rules
        :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
      />
    <!-- <q-btn color="primary" type="submit" label="Validate" /> -->
    </q-form>
  </section>
  <section>
    <article>
      <code>
        yolo
      </code>
    </article>
  </section>
  </q-page>
</template>

<script lang="ts" setup>

import { defineProps, computed, ref, reactive, watch } from 'vue';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { useApi } from 'src/utils/api';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const lobbies = useLobbiesStore();

const lobbyForm = ref();
const lobbyValues = reactive({
  name: '',
  playersMax: 8,
});

watch(lobbyValues, () => {
  console.log("Lobby change", lobbyValues, lobbyForm.value);
});

const lobby = lobbies.fetchAndJoinLobby(props.id);
// lobbies.joinLobby(+props.lobbyId);

const start = () => {
  // props.lobbyId =
  // lobby.resolve()
};

const onFormChange = (evt) => {
  console.log("Form changed", evt);
};

const missingPlayers = computed(() => {
  // return (lobby.playerMax - Object.values(lobby.spectateur))
})
</script>
