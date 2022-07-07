<style>cardinput
  .lobby-card {
    min-width: 250px;
  }
</style>

<template>
  <q-card class="lobby-card">
    <q-card-section>
      <div class="text-h6">{{ name }}</div>
    </q-card-section>
    <q-form ref="form">
      <q-card-section>
        <q-img :src="avatar"></q-img>
        <!-- <PasswordInput dense filled v-model="password"/> -->
      </q-card-section>
      <q-separator />
      <q-card-actions class="q-pa-md row flex-center q-gutter-md">
        <q-btn class="col" @click="emit('joinLobby')">{{ joinText }}</q-btn>
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
  name: {
    type: String,
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
