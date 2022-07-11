<style>cardinput
  .lobby-card {
    display: flex;
    flex-grow: 1;
  }
</style>

<template>
  <q-card flat bordered class="lobby-card">
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
        <q-btn color="primary" class="col" @click="emit('joinLobby')">{{ joinText }}</q-btn>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts" setup>
import { PropType, ref } from "vue";
import { CoalitionChoice } from "src/types/coalition";
import allianceLogo from "src/assets/alliance_logo.svg"
import PasswordInput from "src/components/PasswordInput.vue"
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
    type: Object as PropType<any>
  },
  password: {
    type: String,
  },
});

const emit = defineEmits(['joinLobby']);
const val = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const password = ref<string>();
</script>
