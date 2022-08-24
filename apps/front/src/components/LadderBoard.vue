<template>
<q-card v-for="(userId, index) in usersIds" :key="`${userId}`">
  <q-card-section class="column items-center" horizontal>
      {{ index + 1 }}
      <stats-card v-if="userId === auth.user.id"
        @click="(userIdParam) => emit('click', userIdParam)"
        :userId="userId"
        :name="auth.user.name"
        :nWins="his.getUserMatchesHistory(userId)?.stats.wins"
        :nLosses="his.getUserMatchesHistory(userId)?.stats.losses"
        :ratio="his.getUserMatchesHistory(userId)?.stats.ratio"
        height="50px"
      /><stats-card v-else
        @click="(userIdParam) => emit('click', userIdParam)"
        :userId="userId"
        :name="his.getUserNameByIdFromMatchHistory(userId)"
        :nWins="his.getUserMatchesHistory(userId)?.stats.wins"
        :nLosses="his.getUserMatchesHistory(userId)?.stats.losses"
        :ratio="his.getUserMatchesHistory(userId)?.stats.ratio"
        height="50px"
      />
  </q-card-section>
</q-card>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import StatsCard from 'src/components/StatsCard.vue';
import { defineComponent } from 'vue';
import { asyncComputed } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

const his = useMatchHistoryStore(); his.fetchUserMatchesHistory();
const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const $route = useRoute(); const router = useRouter();

defineComponent({ name: 'LadderBoard' });

const usersIds = asyncComputed(async () => {
  console.log('0---------------------------------------------');
  const raw = await his.getPlayersUsersIds();
  console.log('raw = ', raw);
  const arr: number[] = [];
  raw?.forEach((e) => {
    arr.push(parseInt(e.user_id, 10));
  });
  console.log('1---------------------------------------------');
  arr.forEach(async (userId) => {
    console.log('fetching history for userId = ', userId);
    await his.fetchUserMatchesHistory(userId);
    console.log('fetched history.stats = ', his.getUserMatchesHistory(userId)?.stats);
  });
  console.log('2---------------------------------------------');
  arr.sort((ida: number, idb: number) => {
    console.log('ida = ', ida, ', idb = ', idb);
    const statsa = his.getUserMatchesHistory(ida)?.stats;
    const statsb = his.getUserMatchesHistory(idb)?.stats;
    console.log('in sort, statsa = ', statsa, ', statsb= ', statsb);
    const ra = statsa ? statsa.ratio : 0;
    const rb = statsb ? statsb.ratio : 0;
    console.log('in sort, ra = ', ra, ', rb = ', rb);
    if (ra < rb) {
      return 1;
    } if (ra > rb) {
      return -1;
    }
    return 0;
  });
  console.log('3---------------------------------------------');
  return arr;
});

const emit = defineEmits(['click']);

</script>
