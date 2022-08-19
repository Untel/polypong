<template>
<div>
--- id = {{ userId }} --- <br/>
--- isSelf = {{ isSelf }} --- <br/>
<q-card>
      {{ playerClicked }}
  <q-card-section v-for="
    match in his.getUserMatchesHistory(userId)?.matches"
    :key="`${userId}-${match.matchId}`">
    <q-card-section horizontal>
      <match-card
        :match="match"
        @player-click="(name) => togglePlayer(name, match.matchId)"
      />
      <q-div v-if="toggledMatchId === match.matchId && rel !== undefined">
        <social-card :relname="rel.to.name"/>
        <stats-card :history="his.getUserMatchesHistory(rel.toId)"/>
      </q-div>
    </q-card-section>
  </q-card-section>
</q-card>
</div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore, UserMatchesHistory } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import { useRoute } from 'vue-router';
import MatchCard from 'src/components/MatchCard.vue';
import SocialCard from 'src/components/SocialCard.vue';
import StatsCard from 'src/components/StatsCard.vue';
import { computed, ref } from 'vue';

const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const $route = useRoute();
const userId: number = $route.params.userId ? +$route.params.userId : auth.getUser.id;
const his = useMatchHistoryStore(); his.fetchUserMatchesHistory(userId);

console.log('from url, userId = ', userId);
const isSelf: boolean = userId === auth.user.id;
const userMatchesHistory = computed(() => his.getUserMatchesHistory(userId));
console.log('userMatchesHistory = ', userMatchesHistory);

const playerClicked = ref('');
const toggledMatchId = ref(0);
const rel = computed(() => {
  const ret = soc.getRelByName(playerClicked.value);
  if (ret) { return ret; }
  soc.addRel(playerClicked.value);
  return soc.getRelByName(playerClicked.value);
});

async function togglePlayer(name: string, matchId: number) {
  if (name === auth.getUser.name) { return; }
  playerClicked.value = playerClicked.value === name ? '' : name;
  toggledMatchId.value = toggledMatchId.value === matchId ? 0 : matchId;
  const res = soc.getRelByName(name);
  if (res === undefined) {
    await soc.addRel(name);
  }
}

</script>
