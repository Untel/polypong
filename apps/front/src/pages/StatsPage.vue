<template>
<div>
--- id = {{ userId }} ---
--- isSelf = {{ isSelf }} --- <br/>
<q-card>
  <q-card-section v-for="match in his.getMatches" :key="`${userId}-${match.id}`">
    <match-card :match="match"/>
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
// import RelSearchBar from 'src/components/RelSearchBar.vue';
// import SocialCard from 'src/components/SocialCard.vue';

const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const his = useMatchHistoryStore(); his.fetchHistory();

const $route = useRoute();
const userId: number = $route.params.name ? +$route.params.name : auth.getUser.id;
const isSelf: boolean = userId === auth.user.id;

</script>
