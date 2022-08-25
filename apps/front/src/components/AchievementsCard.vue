<template>
<q-card>
  <q-card-section v-if="achievements.length === 0" class="column items-center">
    <pre>achievements will be displayed here</pre>
  </q-card-section>
  <q-card-section v-else class="column items-center" horizontal>
    <q-card-section v-for="(achievement, index) in achievements" :key="achievement.title">
      <q-separator v-if="index > 0"/>
      <pre>"{{achievement.title}}"<br/>{{achievement.body}}</pre>
    </q-card-section>
  </q-card-section>
</q-card>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore, UserMatchesHistory } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import {
  computed, ComputedRef, defineComponent, PropType,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const achievements: ComputedRef<Achievement[]> = computed(() => {
  const arr: Achievement[] = [];
  if (props.userMatches?.stats && props.userMatches.stats.wins > 0) {
    arr.push({
      title: 'I did it !', body: 'win a game',
    });
  }
  if (props.userMatches?.stats && props.userMatches.stats.wins > 10) {
    arr.push({
      title: 'PongChamp', body: 'win 10 games',
    });
  }
  if (props.userMatches?.stats && props.userMatches.stats.losses > 0) {
    arr.push({
      title: 'I did it...', body: 'lose a game',
    });
  }
  if (props.userMatches?.stats && props.userMatches.stats.losses > 3) {
    arr.push({
      title: 'Oops I did it again', body: 'lose multiple games',
    });
  }
  return arr;
});

console.log('achievements = ', achievements);

const emit = defineEmits(['click']);

</script>
