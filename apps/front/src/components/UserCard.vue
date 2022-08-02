<style lang="scss" scoped>
  .user-card {

  }
</style>

<template>
  <q-card class="user-card" flat bordered>
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="avatar">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label caption>
          {{ caption }}
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <slot />
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script lang="ts" setup>
import { User } from 'src/types/user';
import { defineComponent, PropType } from 'vue';

defineComponent({});
defineProps({
  avatar: String,
  name: String,
  caption: String,
});

</script>
