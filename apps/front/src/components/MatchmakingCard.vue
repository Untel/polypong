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
import { computed } from 'vue';
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
  madeMatches: {
    type: Number,
    default: 0,
  },
  subhead: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  btnColor: {
    type: String,
    default: '',
  },
});

const buttonLabel = computed(() => {
  if ($lobbies.matchmaking) return 'Leave queue';
  return 'Join queue';
});

const btnColor = computed(() => {
  if ($lobbies.matchmaking) return 'negative';
  return 'primary';
});

const btnIcon = computed(() => {
  if ($lobbies.matchmaking) return 'fa-solid fa-house-chimney-user';
  return 'fa-solid fa-table-tennis-paddle-ball';
});

const emit = defineEmits(['joinMatchmake', 'leaveMatchmake', 'spectate']);

function click() {
  if ($lobbies.matchmaking) emit('leaveMatchmake');
  else emit('joinMatchmake');
}

</script>
