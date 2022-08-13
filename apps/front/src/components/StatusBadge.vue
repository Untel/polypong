<template>
      <q-badge floating rounded :color="StatusColor()">
        {{badgeContent}}
      </q-badge>
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
        return 'orange';
      }
      return 'yellow';
    }
    return 'green';
  }
  return 'grey';
}

</script>
