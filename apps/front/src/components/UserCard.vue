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

<!--
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6">Our Planet</div>
            <div class="text-subtitle2">by John Doe</div>
          </div>

          <div class="col-auto">
            <q-btn color="grey-7" round flat icon="more_vert">
              <q-menu cover auto-close>
                <q-list>
                  <q-item clickable>
                    <q-item-section>Remove Card</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Send Feedback</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Share</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-card-section>
-->

<script lang="ts" setup>
import { User } from 'src/types/user';
import { defineComponent, PropType } from 'vue';
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
const emit = defineEmits(['avatarClick']);
function avatarClick(name: string) {
  console.log('avatarClick - name = ', name);
  emit('avatarClick', name);
}

</script>
