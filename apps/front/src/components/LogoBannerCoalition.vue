<template>
  <div class="wrapper">
    <transition
      appear
      enter-active-class="animated slide-down"
      leave-active-class="animated slide-up"
    >
    <svg v-if="showBanner" viewBox="0 0 68 104" :style="`fill: ${colors[coalition]}`">
        <polygon points="0,0 0,80.5 34.3,104 68,80.5 68,0"></polygon>
    </svg>
    </transition>
    <LogoCoalition class="logo" :coalition="coalition" :color="showBanner ? 'white' : colors[coalition]"/>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, computed } from "vue";
import { CoalitionChoice } from "src/types/coalition";
import LogoCoalition from "./LogoCoalition.vue";

const props = defineProps({
  coalition: {
    type: String as PropType<CoalitionChoice>,
    default: CoalitionChoice.ALLIANCE,
  },
  showBanner: {
    type: Boolean,
    default: true,
  }
});
const val = ref(false);
const colors = {
  [CoalitionChoice.ALLIANCE]: 'var(--clr-alliance)',
  [CoalitionChoice.ASSEMBLY]: 'var(--clr-assembly)',
  [CoalitionChoice.FEDERATION]: 'var(--clr-federation)',
  [CoalitionChoice.ORDER]: 'var(--clr-order)',
};
</script>

<style lang="scss" scoped>

.wrapper {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  svg {
    position: absolute;
  }
  .logo {
    display: flex;
    width: 75%;
    align-self: center;
  }
}

</style>