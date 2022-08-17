<template>
<div>
--- id = {{ userId }} ---
--- isSelf = {{ isSelf }} --- <br/>
<q-card>
      {{ playerClicked }}
  <q-card-section v-for="match in his.getMatches" :key="`${userId}-${match.id}`">
    <q-card-section horizontal>
      <match-card
        :match="match"
        @player-click="(name) => togglePlayer(name, match.id)"
      />
      <social-card
        v-if="toggledMatchId === match.id && rel !== undefined"
        :relname="rel.to.name"
      />
    </q-card-section>
  </q-card-section>
</q-card>
</div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import { useRoute } from 'vue-router';
import MatchCard from 'src/components/MatchCard.vue';
import SocialCard from 'src/components/SocialCard.vue';
import { computed, ref } from 'vue';

const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const his = useMatchHistoryStore(); his.fetchHistory();

const $route = useRoute();
const userId: number = $route.params.name ? +$route.params.name : auth.getUser.id;
const isSelf: boolean = userId === auth.user.id;

const playerClicked = ref('');
const toggledMatchId = ref(0);
const rel = computed(() => soc.getRelByName(playerClicked.value));

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
