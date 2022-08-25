<style lang="scss" scoped>
  .wrapper {
    width: 100%;
    height: 100%;
    font-weight: 700;
    font-family: 'futura', 'Noto Sans', 'Arial', 'Helvetica', 'Sans serif';
    font-size: 1.2em;
  }
</style>

<template>
  <div class="wrapper">
    <FssFallback
      :fss-settings="coalitions[coalition || 'federation'].shaderConfig"
    >
      <div>
        <!-- <LogoBannerCoalition
          :coalition="user.coalition || 'alliance'"
          show-banner/> -->
        <q-avatar>
          <img :src="avatar">
        </q-avatar>
        {{ name }}
        {{ email }}
      </div>
    </FssFallback>
  </div>
</template>

<script setup lang="ts">
import { CoalitionChoice, coalitions } from 'src/types/coalition';
import { computed, ComputedRef, PropType } from 'vue';
import { User } from 'src/types/user';
import { useAuthStore } from 'src/stores/auth.store';
import { useSocialStore } from 'src/stores/social.store';
import { asyncComputed } from '@vueuse/core';
import FssFallback from './FssFallback.vue';
import LogoBannerCoalition from './LogoBannerCoalition.vue';

const auth = useAuthStore(); const soc = useSocialStore();

const props = defineProps({
  userId: {
    type: Number,
    default: -1,
  },
});

const isSelf = computed(() => (props.userId === auth.user.id));

const rel = asyncComputed(async () => {
  if (isSelf.value) { return undefined; }
  const res = soc.getRelByUserId(props.userId);
  if (res) { return res; }
  await soc.addRelByUserId(props.userId);
  return soc.getRelByUserId(props.userId);
});

const name = computed(() => {
  if (isSelf.value) { return auth.user.name; }
  if (rel.value) { return rel.value.to.name; }
  return '';
});

const avatar = computed(() => {
  if (isSelf.value) { return auth.user.avatar; }
  if (rel.value) { return rel.value.to.avatar; }
  return '';
});

const coalition: ComputedRef<CoalitionChoice> = computed(() => {
  if (isSelf.value) { return auth.user.coalition; }
  if (rel.value) { return rel.value.to.coalition; }
  return CoalitionChoice.FEDERATION;
});

const email = computed(() => {
  if (isSelf.value) { return auth.user.email; }
  if (rel.value) { return rel.value.to.email; }
  return '';
});

</script>
