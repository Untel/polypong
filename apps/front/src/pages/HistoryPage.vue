<template>
<div>
  <!--
--- userId = {{ userId }} --- <br/>
--- isSelf = {{ isSelf }} --- <br/>
--- toggledMatchId = {{ toggledMatchId }} --- <br/>
--- playerClicked = {{ playerClicked }} --- <br/>
--- HistoryOwner = {{ OwningRel }} --- <br/>
  -->

  <stats-banner :userId="userId"/>

  <div>
    <q-card v-for="
      match in his.getUserMatchesHistory(userId)?.matches"
      :key="`${userId}-${match.id}`"
    >
      <q-card-section>

        <q-card-section horizontal>
          <match-card
            :match="match"
            @player-click="(name) => togglePlayer(name, match.id)"
          />
        </q-card-section>

        <q-card-section v-if="toggledMatchId === match.id"
          horizontal class="column items-center"
        >
          <q-card-section v-if="playerClicked">
            <q-card-section v-if="playerClicked === auth.user.name">
              <stats-card :userId="auth.user.id">
                <social-button
                  @click="stats(auth.user.id)"
                  :tooltip="'stats'" :icon="'fa-solid fa-chart-line'"
                />
              </stats-card>
            </q-card-section>
            <q-card-section v-else-if="rel" horizontal>
              <stats-card :userId="rel.toId"/>
              <q-separator vertical/>
              <social-card :relname="rel.to.name"
                @stats="(id) => stats(id)"
              />
            </q-card-section>
          </q-card-section>
        </q-card-section>

      </q-card-section>
      <q-separator dark inset />
    </q-card>
  </div>

</div>

</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import { useRoute, useRouter } from 'vue-router';
import MatchCard from 'src/components/MatchCard.vue';
import SocialCard from 'src/components/SocialCard.vue';
import StatsCard from 'src/components/StatsCard.vue';
import { computed, ref } from 'vue';
import { asyncComputed } from '@vueuse/core';
import StatsBanner from 'src/components/StatsBanner.vue';
import SocialButton from 'src/components/SocialButton.vue';

const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const $route = useRoute(); const router = useRouter();

const userId = computed(() => {
  if ($route.params.userId) {
    return +$route.params.userId;
  }
  return auth.getUser.id;
});

const his = useMatchHistoryStore();
his.fetchUserMatchesHistory(userId.value);

const isSelf: boolean = userId.value === auth.user.id;
const OwningRel = asyncComputed(async () => {
  if (isSelf) { return undefined; }
  const ret = soc.getRelByUserId(userId.value);
  if (ret) { return ret; }
  await soc.addRelByUserId(userId.value);
  return soc.getRelByUserId(userId.value);
});

const playerClicked = ref('');
const rel = asyncComputed(async () => {
  if (!playerClicked.value || playerClicked.value === auth.user.name) { return undefined; }
  const ret = soc.getRelByName(playerClicked.value);
  if (ret) { return ret; }
  await soc.addRel(playerClicked.value);
  return soc.getRelByName(playerClicked.value);
});

const toggledMatchId = ref(0);
function togglePlayer(name: string, matchId: number) {
  playerClicked.value = playerClicked.value === name ? '' : name;
  if (playerClicked.value === '' && toggledMatchId.value === matchId) {
    toggledMatchId.value = 0;
  } else {
    toggledMatchId.value = matchId;
  }
}

async function stats(id: number) {
  router.push(`/history/${id}`);
}

</script>
