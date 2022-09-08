<template>

  <q-card>
      <q-card-section>
        <q-input
          filled v-model="searchedRel" label="Enter a name"
          @keydown.enter.prevent="searchRel(searchedRel)"
          stack-label dense>
          <template v-slot:append>
            <q-btn @click="searchRel(searchedRel)">search</q-btn>
          </template>
        </q-input>
      </q-card-section>
      <stats-banner
        :userId="userId"
        :name="userId === $auth.user.id ? $auth.user.name : owningRel?.to.name"
        :nWins="his.getUserMatchesHistory(userId)?.stats.wins"
        :nLosses="his.getUserMatchesHistory(userId)?.stats.losses"
        :nRatio="his.getUserMatchesHistory(userId)?.stats.ratio"
      />
  </q-card>
  <q-tabs
    v-model="tab" dense class="text-grey" active-color="primary"
    indicator-color="primary" narrow-indicator
  >
    <q-tab name="history" label="history"/>
    <q-tab name="achievements" label="achievements"/>
    <q-tab name="ladder" label="ladder"/>
  </q-tabs>
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="history">
      <q-card v-for="
        match in his.getUserMatchesHistory(userId)?.matches"
        :key="`${userId}-${match.id}`"
      >
        <q-card-section>

          <q-card-section horizontal>
            <match-card
              :match="match"
              @player-click="(name, userId) => togglePlayer(name, userId, match.id)"
            />
          </q-card-section>

          <q-card-section v-if="toggledMatchId === match.id"
            horizontal class="column items-center"
          >
            <q-card-section v-if="playerClicked">
              <q-card-section v-if="playerClicked === $auth.user.name">
                <stats-card
                  @click="(userIdParam) => stats(userIdParam)"
                  :userId="$auth.user.id"
                  :name="$auth.user.name"
                  :nWins="playerClickedStats?.wins"
                  :nLosses="playerClickedStats?.losses"
                  :ratio="playerClickedStats?.ratio"
                  height="280px"
                >
                  <social-button
                    @click="stats($auth.user.id)"
                    :tooltip="'stats'" :icon="'fa-solid fa-chart-line'"
                  />
                </stats-card>
              </q-card-section>
              <q-card-section v-else-if="rel" horizontal>
                <stats-card
                  @click="(userIdParam) => stats(userIdParam)"
                  :userId="rel.toId"
                  :name="rel.to.name"
                  :nWins="playerClickedStats?.wins"
                  :nLosses="playerClickedStats?.losses"
                  :ratio="playerClickedStats?.ratio"
                  height="280px"
                />
                <q-separator vertical/>
                <social-card :relname="rel.to.name"
                  @stats="(id) => stats(id)"
                  @invite-to-lobby="(id) => inviteToLobby(id)"
                  @message="(id) => message(id)"
                  @add-friend="(name) => addFriend(name)"
                  @unfriend="(name) => unfriend(name)"
                  @block="(name) => block(name)"
                  @unblock="(name) => unblock(name)"
                />
              </q-card-section>
            </q-card-section>
          </q-card-section>

        </q-card-section>
        <q-separator dark inset />
      </q-card>
    </q-tab-panel>
    <q-tab-panel name="achievements">
      <achievements-card
        :userId="userId"
        :name="userId === $auth.user.id ? $auth.user.name : owningRel?.to.name"
        :userMatches="his.getUserMatchesHistory(userId)"
      />
    </q-tab-panel>
    <q-tab-panel name="ladder">
      <ladder-board
        @click="(userIdParam) => stats(userIdParam)"
      />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import { useSocialStore } from 'src/stores/social.store';
import { useRoute, useRouter } from 'vue-router';
import MatchCard from 'src/components/MatchCard.vue';
import SocialCard from 'src/components/SocialCard.vue';
import StatsCard from 'src/components/StatsCard.vue';
import {
  computed, ComputedRef, onMounted, ref,
} from 'vue';
import { asyncComputed } from '@vueuse/core';
import StatsBanner from 'src/components/StatsBanner.vue';
import SocialButton from 'src/components/SocialButton.vue';
import LadderBoard from 'src/components/LadderBoard.vue';
import AchievementsCard from 'src/components/AchievementsCard.vue';
import { useLobbiesStore } from 'src/stores/lobbies.store';

const $auth = useAuthStore(); $auth.fetchConnectedUsers();
const soc = useSocialStore();
const $route = useRoute(); const router = useRouter();
const $lobbies = useLobbiesStore();

onMounted(async () => {
  await soc.fetchRelationships();
});

const userId = computed(() => {
  if ($route.params.userId) {
    return +$route.params.userId;
  }
  return $auth.getUser.id;
});

const his = useMatchHistoryStore();
his.fetchUserMatchesHistory(userId.value);

const isSelf: ComputedRef<boolean> = computed(() => userId.value === $auth.user.id);

const owningRel = asyncComputed(async () => {
  if (isSelf.value) { return undefined; }
  await soc.fetchRelationships();
  const ret = soc.getRelByUserId(userId.value);
  if (ret) { return ret; }
  try {
    await soc.addRelByUserId(userId.value);
  } catch (e) {
    // e
  }
  return soc.getRelByUserId(userId.value);
});

const searchedRel = ref('');
async function searchRel(name: string) {
  if (name === $auth.user.name) {
    router.push(`/profile/${$auth.user.id}`);
    return;
  }
  let rel = soc.getRelByName(name);
  if (!rel) {
    try { await soc.addRel(name); } catch (e) { /* console.log(e) */ }
    rel = soc.getRelByName(name);
  }
  if (rel) { router.push(`/profile/${rel.toId}`); }
}

const playerClicked = ref('');

const playerClickedId = ref(-1);
const playerClickedStats = asyncComputed(async () => {
  if (playerClickedId.value === -1) { return undefined; }
  const userMatchesHistory = await his.fetchUserMatchesHistory(playerClickedId.value);
  return userMatchesHistory?.stats;
});

const rel = asyncComputed(async () => {
  if (!playerClicked.value || playerClicked.value === $auth.user.name) { return undefined; }
  const ret = soc.getRelByName(playerClicked.value);
  if (ret) { return ret; }
  try {
    await soc.addRel(playerClicked.value);
  } catch (e) {
    // e
  }
  return soc.getRelByName(playerClicked.value);
});

const toggledMatchId = ref(0);
function togglePlayer(name: string, usrId: number, matchId: number) {
  playerClicked.value = playerClicked.value === name ? '' : name;
  playerClickedId.value = playerClickedId.value === usrId ? -1 : usrId;
  if (playerClicked.value === '' && toggledMatchId.value === matchId) {
    toggledMatchId.value = 0;
  } else {
    toggledMatchId.value = matchId;
  }
}

const queryParam = $route.query.matchId;
if (queryParam) {
  togglePlayer($auth.user.name, $auth.user.id, +queryParam);
}

const tab = ref('history');
async function stats(id: number) {
  tab.value = 'history';
  router.push(`/profile/${id}`);
}

const usersIds = asyncComputed(async () => {
  const raw = await his.getPlayersUsersIds();
  const arr: number[] = [];
  raw?.forEach((e) => {
    arr.push(parseInt(e.user_id, 10));
  });
  return arr;
});

async function inviteToLobby(id: number) {
//  console.log(`invite to lobby ${id}`);
  await $lobbies.inviteUserToLobby(id);
}

async function message(id: number) {
  router.push(`/chat/${id}`);
}
async function addFriend(name: string) { await soc.send_friendship(name); }
async function unfriend(name: string) { await soc.unsend_friendship(name); }
async function block(name: string) { await soc.send_block(name); }
async function unblock(name: string) { await soc.unsend_block(name); }

</script>
