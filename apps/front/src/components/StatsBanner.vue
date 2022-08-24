<template>
  <q-banner rounded class="bg-grey-3">
    <q-img :src=coaBackground height="160px">
      <div class="absolute-full text-subtitle2 flex flex-center">
        name: {{ name }}
        <br/>
        wins: {{ nWins }}
        <br/>
        losses: {{ nLosses }}
        <br/>
        ratio: {{ ratio }}
      </div>
    </q-img>
  </q-banner>
</template>

<script lang="ts" setup>
import {
  computed,
  ComputedRef,
  defineComponent,
} from 'vue';
import { asyncComputed } from '@vueuse/core';
import { useAuthStore } from 'src/stores/auth.store';
import { CoalitionChoice } from 'src/types';
import { useSocialStore } from '../stores/social.store';

const soc = useSocialStore(); const auth = useAuthStore();

defineComponent({ name: 'StatsBanner' });

const props = defineProps({
  userId: {
    type: Number, default: -1,
  },
  name: {
    type: String, default: '',
  },
  nWins: {
    type: Number, defaut: 0,
  },
  nLosses: {
    type: Number, default: 0,
  },
  ratio: {
    type: Number, default: 1,
  },
  height: {
    type: String,
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

const coalition: ComputedRef<CoalitionChoice> = computed(() => {
  if (isSelf.value) { return auth.user.coalition; }
  if (rel.value) { return rel.value.to.coalition; }
  return CoalitionChoice.FEDERATION;
});

const coaBackground = computed(() => `/src/assets/${coalition.value}_background.jpg`);

</script>
