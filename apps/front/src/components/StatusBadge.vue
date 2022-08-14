<template>
  <q-fab
    :label=badgeContent
    label-position="left"
    :color=StatusColor()
    hide-icon
    direction="left"
  >
    <q-fab-action color="primary" @click="onClick" hide-icon label="Email" />
    <q-fab-action color="secondary" @click="onClick" hide-icon label="Alarm" />
  </q-fab>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { defineComponent, ref } from 'vue';

const auth = useAuthStore();

defineComponent({ name: 'OnlineBadge' });
const props = defineProps({
  id: {
    type: Number,
  },
});

const badgeContent = ref('');

function StatusColor(): string {
  const res = '';
  const u = auth.getConnectedUsers.find((user) => user.id === props.id);
  if (u) {
    if (u.inLobby === true) {
      if (u.inGame === true) {
        badgeContent.value = 'in game';
        return 'orange';
      }
      badgeContent.value = 'in lobby';
      return 'yellow';
    }
    badgeContent.value = 'online';
    return 'green';
  }
  badgeContent.value = 'offline';
  return 'grey';
}

function onClick() {
  console.log('click');
}

</script>
