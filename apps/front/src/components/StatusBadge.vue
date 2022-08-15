<template>
  <q-fab
    :label="status"
    :color="color"
    direction="left"
    push
    :icon="icon"
    :hide-icon="status !== 'in lobby' && status !== 'in game' ? true : false"
    padding="xs"
  >
    <q-fab-action v-if="status === 'in lobby'" label="join lobby"
      @click="onClick"
      :color="color" hide-icon padding="xs"
      push
    />
    <q-fab-action v-if="status === 'in game'" label="spectate game"
      @click="onClick"
      :color="color" hide-icon padding="xs"
      push
    />
  </q-fab>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import {
  computed, defineComponent, ref,
} from 'vue';

const auth = useAuthStore();

defineComponent({ name: 'OnlineBadge' });
const props = defineProps({
  id: {
    type: Number,
  },
});

function onClick(): void {
  console.log('click');
}

const users = auth.getConnectedUsers;
const user = computed(() => users.find((u: any) => u.id === props.id));

const status = computed(() => {
  if (user.value) {
    if (user.value.inLobby) {
      if (user.value.inGame) {
        return 'in game';
      }
      return 'in lobby';
    }
    return 'online';
  }
  return 'offline';
});

const color = computed(() => {
  if (user.value) {
    if (user.value.inLobby) {
      if (user.value.inGame) {
        return 'light-blue-10';
      }
      return 'teal-9';
    }
    return 'green';
  }
  return 'grey';
});

const icon = computed(() => {
  if (user.value) {
    if (user.value.inLobby) {
      if (user.value.inGame) {
        return 'keyboard_arrow_left';
      }
      return 'keyboard_arrow_left';
    }
    //    return 'fas fa-circle-dot';
  }
  // return 'fas fa-power-off';
  return '';
});

// function getStatus(ask: string): string {
//  if (user.value) {
//    if (user.value.inLobby === true) {
//      if (user.value.inGame === true) {
//        status.value = 'in game';
//        color.value = 'light-blue-10';
//        icon.value = 'keyboard_arrow_left';
//      }
//      status.value = 'in lobby';
//      color.value = 'teal-9';
//      icon.value = 'keyboard_arrow_left';
//    }
//    status.value = 'online';
//    color.value = 'green';
//    icon.value = 'fas fa-circle-dot';
//  }
//  status.value = 'offline';
//  color.value = 'grey';
//  icon.value = 'fas fa-power-off';
//  if (ask === 'status') {
//    return status.value;
//  } if (ask === 'color') {
//    return color.value;
//  }
//  return icon.value;
// }

</script>
