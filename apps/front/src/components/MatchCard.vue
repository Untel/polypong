<template>
  <q-card-section horizontal>
    <span>the {{ date[0] }} at {{ date[1] }}</span>
    <q-card-section v-for="
      player in players" :key="`player-${player.id}`"
    >
      <social-avatar
        @click="playerClick(player.user.name)"
        :id="player.user.id" :name="player.user.name" :avatar="player.user.avatar"
      />
    </q-card-section>
  </q-card-section>
</template>

<script lang="ts" setup>
import { match } from 'minimatch';
import { useAuthStore } from 'src/stores/auth.store';
import { Match } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import {
  computed, defineComponent, PropType,
} from 'vue';
import SocialAvatar from './SocialAvatar.vue';

defineComponent({ name: 'MatchCard' });

const props = defineProps({
  match: {
    type: Object as PropType<any>,
  },
});

const auth = useAuthStore(); const soc = useSocialStore();

const date = computed(
  () => props.match?.finishedAt?.split('T').join(',').split('.').join(',')
    .split(','),
);
console.log('date = ', date);

const players = computed(
  () => props.match?.players?.slice().sort((a, b) => a.rank - b.rank),
);

const emit = defineEmits(['playerClick']);

function playerClick(name: string) {
  emit('playerClick', name);
}

</script>
