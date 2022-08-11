<style lang="scss" scoped>
  .user-card {

  }

  .color {
    border-radius: 50%;
    width: 20px;
    height: 20px;
  }
</style>

<template>
  <q-card class="user-card" flat bordered>
    <q-item>
      <q-item-section avatar>
        <q-avatar :style="`background-color: ${color || 'transparent'}`">
          <img :src="avatar">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ name }}</q-item-label>
        <q-item-label>
          <div class="color" :style="`background-color: ${color || 'transparent'}`">
            <q-popup-proxy v-if="canUpdate" cover transition-show="scale" transition-hide="scale">
              <q-color :model-value="color"
                @change="evt => $emit('change', { color: evt })"
              />
            </q-popup-proxy>
          </div>
        </q-item-label>
        <q-item-label caption>
          {{ caption }}
          <!-- <q-avatar icon="signal_wifi_off" text-color="primary" /> -->

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
  color: String,
  canUpdate: Boolean,
});

</script>
