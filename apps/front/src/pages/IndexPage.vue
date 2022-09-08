<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<template>
  <q-page class="row">
    <!--
    <div class="wrapper">
      <UserBanner :userId="$auth.user.id"/>
    </div>
    <q-card>
      <h6>
        {{ userMatchesHistory }}
      </h6>
    </q-card>
    -->
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useMatchHistoryStore } from 'src/stores/history.store';
import UserBanner from 'src/components/UserBanner.vue';
import { computed, onMounted } from 'vue';

const $auth = useAuthStore();
const $his = useMatchHistoryStore();

const userMatchesHistory = computed(() => $his.getUserMatchesHistory($auth.getUser.id));

onMounted(() => {
  $his.fetchUserMatchesHistory($auth.getUser.id);
});
</script>
