<template>
  <q-banner rounded class="bg-grey-3">
    <q-img :src=coaBackground height="160px">
      <div class="absolute-full text-subtitle2 flex flex-center">
        name: {{ name }}
        <br/>
        played: {{ nPlayed }}
        <br/>
        wins: {{ nWins }}
        <br/>
        losses: {{ nLosses }}
        <br/>
        ratio: {{ ratio }}
      </div>
    </q-img>
  </q-banner>
</template>

<script lang="ts" setup>
import {
  computed,
  ComputedRef,
  defineComponent,
  ref,
} from 'vue';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { asyncComputed } from '@vueuse/core';
import { useAuthStore } from 'src/stores/auth.store';
import { CoalitionChoice } from 'src/types';
import { useSocialStore } from '../stores/social.store';
import SocialAvatar from './SocialAvatar.vue';

const his = useMatchHistoryStore();
const soc = useSocialStore();
const auth = useAuthStore();

defineComponent({ name: 'StatsBanner' });

const props = defineProps({
  userId: {
    type: Number,
    default: -1,
  },
});

const history = asyncComputed(() => his.fetchUserMatchesHistory(props.userId));

const nPlayed = computed(() => {
  if (props.userId !== -1 && history.value) {
    return history.value.matches.length;
  }
  return 0;
});

const nWins = computed(() => {
  if (props.userId !== -1 && history.value) {
    let res = 0;
    history.value.matches.forEach((m) => {
      const nplayers = m.players.length;
      const winThreshold = nplayers / 2;
      m.players.forEach((p) => {
        if (p.user.id === props.userId) {
          if (p.rank <= winThreshold) {
            res += 1;
          }
        }
      });
    });
    return res;
  }
  return 0;
});

const nLosses = computed(() => nPlayed.value - nWins.value);

const isSelf = computed(() => (props.userId === auth.user.id));

const rel = asyncComputed(async () => {
  if (isSelf.value) { return undefined; }
  const res = soc.getRelByUserId(props.userId);
  if (res) { return res; }
  await soc.addRelByUserId(props.userId);
  return soc.getRelByUserId(props.userId);
});

const name = computed(() => {
  if (isSelf.value) { return auth.user.name; }
  if (rel.value) { return rel.value.to.name; }
  return '';
});

const avatar = computed(() => {
  if (isSelf.value) { return auth.user.avatar; }
  if (rel.value) { return rel.value.to.avatar; }
  return '';
});

const coalition: ComputedRef<CoalitionChoice> = computed(() => {
  if (isSelf.value) { return auth.user.coalition; }
  if (rel.value) { return rel.value.to.coalition; }
  return CoalitionChoice.FEDERATION;
});

const coaBackground = computed(() => `/src/assets/${coalition.value}_background.jpg`);

// const email = computed(() => {
//  if (isSelf.value) { return auth.user.email; }
//  if (rel.value) { return rel.value.to.email; }
//  return '';
// });

const ratio = computed(() => {
  if (nPlayed.value === 0) {
    return 1;
  }
  const numerator = nWins.value * 100;
  const denominator = nLosses.value * 100;
  return numerator / denominator;
});

// const emit = defineEmits([
//  'addFriend', 'unfriend', 'block', 'unblock',
// ]);

// function inviteToLobby(id: number) { emit('inviteToLobby', id); }

</script>
