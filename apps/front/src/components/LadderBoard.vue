<template>
<q-card v-for="(userId, index) in usersIds" :key="`${userId}`">
  <q-card-section class="column items-center">
    <pre>{{index + 1}}</pre>
    <stats-card :userId="userId" height='50px'/>
  </q-card-section>
</q-card>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import { useRoute, useRouter } from 'vue-router';
import StatsCard from 'src/components/StatsCard.vue';
import { defineComponent } from 'vue';
import { asyncComputed } from '@vueuse/core';

const his = useMatchHistoryStore(); his.fetchUserMatchesHistory();
const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();

defineComponent({ name: 'LadderBoard' });

const usersIds = asyncComputed(async () => {
  const raw = await his.getPlayersUsersIds();
  const arr: number[] = [];
  raw?.forEach((e) => {
    arr.push(parseInt(e.user_id, 10));
  });
  return arr;
});

asyncComputed(async () => {
  usersIds.value.forEach(async (userId) => {
    await his.fetchUserMatchesHistory(userId);
  });
});

</script>
