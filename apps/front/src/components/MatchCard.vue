<template>
<q-card>
  <q-card-section horizontal>
    <q-card-section>{{ match.id }}</q-card-section>
    <q-card-section v-for="
      player in match.players" :key="`player-${player.id}`"
    >
    <span>
      {{ player.user.name }} rank : {{ player.rank }}
    </span>
    </q-card-section>
  </q-card-section>
</q-card>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useSocialStore } from 'src/stores/social.store';
import { defineComponent, PropType } from 'vue';

defineComponent({ name: 'MatchCard' });

const props = defineProps({
  match: {
    type: Object as PropType<any>,
  },
});

const auth = useAuthStore(); const soc = useSocialStore();

// const emit = defineEmits(['matchCardClick']);
//
// function onClick(): void {
//  emit('matchCardClick');
// }

</script>
