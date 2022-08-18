<style scoped lang="scss">
  .wrapper {
  }
</style>

<template>
  <q-page class="row">
    <WhatsApp />
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { useThreadStore } from 'src/stores/thread.store';
import WhatsApp from 'src/components/WhatsApp.vue';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { Notify } from 'quasar';
import { MandeError } from 'mande';

const $auth = useAuthStore();
const $thread = useThreadStore();
const $route = useRoute();

watch(
  () => $route.params.id,
  (id) => {
    try {
      $thread.getOrCreateThread(+id);
    } catch (e: MandeError) {
      Notify.create({
        message: e.message,
        color: 'negative',
      });
    }
  },
  { immediate: true },
);
</script>
