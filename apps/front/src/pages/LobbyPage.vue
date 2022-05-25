<template>
  <q-page padding>
    Here we should config the lobby page and wait for peoples to connect

    <q-btn @click="start">Start game</q-btn>
  </q-page>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

const props = defineProps({
  lobbyId: Number,
});

const start = () => {
  console.log('Starting');
}
</script>
