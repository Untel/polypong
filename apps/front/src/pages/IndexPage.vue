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
        {{ matchs }}
      </pre>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import UserBanner from 'src/components/UserBanner.vue';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const $auth = useAuthStore();
const $history = useMatchHistoryStore();
const { matchs } = storeToRefs($history);
onMounted(() => {
  $history.fetchHistory();
});
</script>
