<template>
  <q-item clickable>
    <q-item-section avatar>
      <q-avatar>
        <img :src="avatar" />
        <div
          :class="[
            'online-round',
            online,
          ]">
        </div>
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ name }}</q-item-label>
      <q-item-label caption>{{ online }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
defineProps({
  avatar: String,
  name: String,
  online: String,
});
</script>
<style lang="scss">
  .online-round {
    --q-status: var(--q-positive);
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--q-status);
    box-shadow: 1px 1px 1px 1px var(--q-status);
  }

  .online {
    --q-status: var(--q-positive);
  }
  .ingame {
    --q-status: var(--q-accent);
  }
  .inlobby {
    --q-status: var(--q-primary);
  }
  .offline {
    --q-status: var(--q-negative);
  }
</style>
