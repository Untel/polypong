<template>
  <div class="wrapper">
    <svg v-if="showBanner" viewBox="0 0 68 104" :style="`fill: ${colors[coalition]}`">
        <polygon points="0,0 0,80.5 34.3,104 68,80.5 68,0"></polygon>
    </svg>
    <LogoCoalition
      :class="{
        'logo': true,
        'selected': showBanner,
        [`logo-${coalition}`]: true
      }"
      :coalition="coalition"
      :color="showBanner ? 'white' : colors[coalition]"/>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, PropType, ref } from 'vue';
import { CoalitionChoice } from 'src/types/coalition';
import LogoCoalition from './LogoCoalition.vue';

const props = defineProps({
  coalition: {
    type: String as PropType<CoalitionChoice>,
    default: CoalitionChoice.ALLIANCE,
  },
  showBanner: {
    type: Boolean,
    default: true,
  },
});
const val = ref(false);
const colors = {
  [CoalitionChoice.ALLIANCE]: 'var(--clr-alliance)',
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
    &.logo-federation {
      // background-color: red;
      -webkit-transform-origin-y: calc(50% - 6px);
    }
    &.logo-alliance {
      // background-color: red;
      -webkit-transform-origin-y: calc(50% + 3px);
    }
    display: flex;
    width: 75%;
    align-self: center;
    transition: transform .5s ease-in-out;
    transform-origin: center;
    &:hover, .selected {
      transform: rotate(360deg);
    }
  }
}

</style>
