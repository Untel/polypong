<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<template>
  <q-page class="row">
    <div class="wrapper">
      <UserBanner :user="$auth.user"/>
    </div>
    <q-card>
      <pre>
        {{ userMatchHistory }}
      </pre>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import UserBanner from 'src/components/UserBanner.vue';
import { computed, onMounted } from 'vue';

const $auth = useAuthStore();
const $his = useMatchHistoryStore();

const { userMatchHistory } = computed(() => $his.getUserMatches($auth.getUser.id));

onMounted(() => {
  $his.fetchUserMatchHistory($auth.getUser.id);
});
</script>
