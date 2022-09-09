<style lang="scss" scoped>
  .user-card {
    min-width: 300px;
    max-width: 300px;
  }

  .color {
    border-radius: 50%;
    width: 20px;
    height: 20px;
  }
</style>

<template>
  <q-card class="user-card" flat bordered>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <q-item dense>
            <q-item-section avatar>
              <social-avatar
                @avatar-click="(name) => avatarClick(name)"
                :name="name"
                :avatar="avatar"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                {{ name }}
                <q-badge v-if="isHost" color="teal-10">host</q-badge>
              </q-item-label>
              <q-item-label>
                <div class="color" :style="`background-color: ${color || 'transparent'}`">
                  <q-popup-proxy
                    v-if="canUpdate" cover transition-show="scale"
                    transition-hide="scale"
                  >
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
        </div>

        <div class="col-auto">
          <q-card-actions>
            <slot name="exit"></slot>
          </q-card-actions>
        </div>
      </div>

    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import SocialAvatar from './SocialAvatar.vue';

defineComponent({});
defineProps({
  avatar: String,
  name: String,
  caption: String,
  color: String,
  canUpdate: Boolean,
  isHost: {
    type: Boolean, default: false,
  },
});
const emit = defineEmits(['avatarClick', 'change']);
function avatarClick(name: string) {
  emit('avatarClick', name);
}

</script>
