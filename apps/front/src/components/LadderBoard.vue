<template>
<div v-if="!usersIds || usersIds.length === 0">
  <q-card class="column items-center">
    <pre>ladder with be displayed here</pre>
  </q-card>
</div>
<div v-else>
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
</div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import StatsCard from 'src/components/StatsCard.vue';
import { defineComponent, onMounted, ref } from 'vue';
import { asyncComputed } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

const his = useMatchHistoryStore(); his.fetchUserMatchesHistory();
const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const $route = useRoute(); const router = useRouter();

defineComponent({ name: 'LadderBoard' });

const usersIds = ref<number[]>([]);

onMounted(async () => {
  // console.log('0---------------------------------------------');
  const raw = await his.getPlayersUsersIds();
  // console.log('raw = ', raw);
  raw?.forEach((e) => {
    usersIds.value.push(parseInt(e.user_id, 10));
  });
  // console.log('1---------------------------------------------');

  // for (let i = 0; i < usersIds.value.length; i += 1) {
  //  // eslint-disable-next-line no-await-in-loop
  //  await his.fetchUserMatchesHistory(usersIds.value[i]);
  // }

  const promises = await Promise.all(
    usersIds.value.map(async (el) => {
      await his.fetchUserMatchesHistory(el);
    }),
  );

  //  usersIds.value.forEach(async (userId) => {
  //    // console.log('fetching history for userId = ', userId);
  //    await his.fetchUserMatchesHistory(userId);
  //    // console.log('fetched history.stats = ', his.getUserMatchesHistory(userId)?.stats);
  //  });

  // console.log('2---------------------------------------------');
  usersIds.value.sort((ida: number, idb: number) => {
    // console.log('ida = ', ida, ', idb = ', idb);
    const statsa = his.getUserMatchesHistory(ida)?.stats;
    const statsb = his.getUserMatchesHistory(idb)?.stats;
    // console.log('in sort, statsa = ', statsa, ', statsb= ', statsb);
    const ra = statsa ? statsa.ratio : 0;
    const rb = statsb ? statsb.ratio : 0;
    // console.log('in sort, ra = ', ra, ', rb = ', rb);
    if (ra < rb) {
      return 1;
    } if (ra > rb) {
      return -1;
    }
    return 0;
  });
  // console.log('after sort, usersIds = ', usersIds.value);
  // console.log('3---------------------------------------------');
});

// const usersIds = asyncComputed(async () => {
//  console.log('0---------------------------------------------');
//  const raw = await his.getPlayersUsersIds();
//  console.log('raw = ', raw);
//  const arr: number[] = [];
//  raw?.forEach((e) => {
//    arr.push(parseInt(e.user_id, 10));
//  });
//  console.log('1---------------------------------------------');
//  arr.forEach(async (userId) => {
//    console.log('fetching history for userId = ', userId);
//    await his.fetchUserMatchesHistory(userId);
//    console.log('fetched history.stats = ', his.getUserMatchesHistory(userId)?.stats);
//  });
//  console.log('2---------------------------------------------');
//  arr.sort((ida: number, idb: number) => {
//    console.log('ida = ', ida, ', idb = ', idb);
//    const statsa = his.getUserMatchesHistory(ida)?.stats;
//    const statsb = his.getUserMatchesHistory(idb)?.stats;
//    console.log('in sort, statsa = ', statsa, ', statsb= ', statsb);
//    const ra = statsa ? statsa.ratio : 0;
//    const rb = statsb ? statsb.ratio : 0;
//    console.log('in sort, ra = ', ra, ', rb = ', rb);
//    if (ra < rb) {
//      return 1;
//    } if (ra > rb) {
//      return -1;
//    }
//    return 0;
//  });
//  console.log('3---------------------------------------------');
//  return arr;
// });

const emit = defineEmits(['click']);

</script>
