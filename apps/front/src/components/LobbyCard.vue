<style>cardinput
  .lobby-card {
    display: flex;
    flex-grow: 1;
  }
</style>

<template>
  <q-card flat bordered class="lobby-card" :color="'primary'">
    <q-form ref="form">

      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img :src="avatar">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ name }}</q-item-label>
          <q-item-label caption>
            {{ subhead }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-card-section>
        <slot />
      </q-card-section>
      <q-separator />
      <q-card-actions class="q-pa-md row q-gutter-md">
        <q-btn
          class="col" @click="emit('joinLobby')"
          :icon="!props.isPrivate ? 'sports_tennis' : 'lock'"
          :label="isInsideLobby ? 'Current Lobby' : props.joinText"
          :color="btnColor"
          />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { useLobbiesStore } from 'src/stores/lobbies.store';

const $lobbies = useLobbiesStore();

const props = defineProps({
  id: {
    type: Number,
  },
  name: {
    type: String,
    default: '',
  },
  subhead: {
    type: String,
    default: '',
  },
  joinText: {
    type: String,
    default: 'Join',
  },
  avatar: {
    type: String,
    default: '',
  },
  players: {
    type: Number,
  },
  spectators: {
    type: Number,
  },
  host: {
    type: Object as PropType<any>,
  },
  isPrivate: {
    type: Boolean,
  },
});

const isInsideLobby = computed(() => {
  if ($lobbies.getActiveLobby && props.id) {
    return $lobbies.getActiveLobby.id === props.id;
  }
  return false;
});

const btnColor = computed(() => {
  if (props.isPrivate) return 'negative';
  if (isInsideLobby.value) return 'accent';
  return 'primary';
});

const emit = defineEmits(['joinLobby']);
const val = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const password = ref<string>();
</script>
