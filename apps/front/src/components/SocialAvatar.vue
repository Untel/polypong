<template>
  <q-btn round @click="avatarClick">
    <q-avatar>
      <img :src="avatar"/>
      <q-tooltip>
        {{name}}
      </q-tooltip>
    </q-avatar>
  </q-btn>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { defineComponent } from 'vue';

const auth = useAuthStore();

defineComponent({ name: 'SocialAvatar' });
const props = defineProps({
  id: {
    type: Number, default: -1,
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
});

function onClick(): void {
//  console.log('click');
}

const emit = defineEmits(['avatarClick']);

function avatarClick() { emit('avatarClick', props.name); }

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
