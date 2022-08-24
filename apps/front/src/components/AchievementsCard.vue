<template>
<q-card>
  <q-card-section class="column items-center" horizontal>
    <pre> {{ name }}</pre><br/>
    <pre> {{ userMatches }}</pre><br/>
    <pre> {{ achievements }}</pre><br/>
    <!--
    <q-card-section v-for="a in achievements" :key="`${a.title}`">
      {{ a }}
    </q-card-section>
    -->
  </q-card-section>
</q-card>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore, UserMatchesHistory } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import StatsCard from 'src/components/StatsCard.vue';
import {
  computed, ComputedRef, defineComponent, PropType,
} from 'vue';
import { asyncComputed } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import { PROPERTY_TYPES } from '@babel/types';
import { type } from 'os';

const his = useMatchHistoryStore(); his.fetchUserMatchesHistory();
const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const $route = useRoute(); const router = useRouter();

const props = defineProps({
  userId: {
    type: Number, default: -1,
  },
  name: {
    type: String, default: '',
  },
  userMatches: {
    type: Object as PropType<UserMatchesHistory>, defaut: undefined,
  },
});

defineComponent({ name: 'AchievementsCard' });

interface Achievement {
  title: string;
  body: string;
}

const achievements: ComputedRef<Array<Achievement>> = computed(() => {
  const arr: Achievement[] = [];
  if (props.userMatches?.stats && props.userMatches.stats.wins > 0) {
    console.log('LALA');
    arr.push({
      title: 'I did it !', body: 'win a game',
    });
  }
  return arr;
});

console.log('achievements = ', achievements);

const emit = defineEmits(['click']);

</script>
