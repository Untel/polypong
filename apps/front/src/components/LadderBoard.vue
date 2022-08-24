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

const emit = defineEmits(['click']);

</script>
