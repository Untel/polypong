<template>
  <div>
    <img :src="allianceLogo" alt=""/>
    <!-- <q-icon :icon="`img:${allianceLogo}`" />
    <q-checkbox
      v-model="val"
      color="green"
      :checked-icon="`img:${allianceLogo}`"
      :unchecked-icon="`img:${allianceLogo}`"
      indeterminate-icon="help"
    /> -->
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { CoalitionChoice } from 'src/types/coalition';
import allianceLogo from 'src//alliance_logo.svg';

const props = defineProps({
  coalition: {
    type: String as PropType<CoalitionChoice>,
    default: CoalitionChoice.ALLIANCE,
  },
});
const val = ref(false);
</script>
