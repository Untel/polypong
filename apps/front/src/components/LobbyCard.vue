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
          class="col" @click="click()"
          :icon="btnIcon"
          :label="buttonLabel"
          :color="btnColor"
          />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { number } from '@intlify/core-base';

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
  isCreated: {
    type: Boolean, default: false,
  },
  isPrivate: {
    type: Boolean,
  },
  isStarted: {
    type: Boolean,
  },
  isFull: {
    type: Boolean,
  },
});

const isInsideLobby = computed(() => {
  if ($lobbies.getActiveLobby && props.id) {
    return $lobbies.getActiveLobby.id === props.id;
  }
  return false;
});

const buttonLabel = computed(() => {
  if (!props.isCreated) return 'Create';
  if (isInsideLobby.value) return 'Current';
  if (props.isStarted) return 'Spectate';
  if (props.isFull) return 'Full';
  return 'Join';
});

const btnColor = computed(() => {
  if (props.isPrivate) return 'negative';
  if (isInsideLobby.value) return 'accent';
  if (props.isStarted) return 'teal-9';
  if (props.isFull) return 'warning';
  return 'primary';
});

const btnIcon = computed(() => {
  if (props.isStarted) return 'fa-solid fa-eye';
  if (props.isPrivate) return 'lock';
  if (isInsideLobby.value) return 'fa-solid fa-house-chimney-user';
  if (props.isFull) return 'fa-solid fa-hand';
  return 'fa-solid fa-table-tennis-paddle-ball';
});

const emit = defineEmits(['joinLobby', 'joinGame', 'spectate']);

function click() {
  if (props.isStarted) {
    if (isInsideLobby.value) {
      emit('joinGame');
    } else {
      emit('spectate');
    }
  } else if (!props.isFull) {
    emit('joinLobby');
  }
}

const val = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const password = ref<string>();
</script>
