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
      :fss-settings="coalitions[user.coalition || 'federation'].shaderConfig"
    >
      <div>
        <!-- <LogoBannerCoalition
          :coalition="user.coalition || 'alliance'"
          show-banner/> -->
        <q-avatar>
          <img :src="user.avatar">
        </q-avatar>
        {{ user.name }}
        {{ user.email }}
        <pre>
          {{ user }}
        </pre>
      </div>
    </FssFallback>
  </div>
</template>

<script setup lang="ts">
import { CoalitionChoice } from "src/types/coalition"
import { coalitions } from 'src/types/coalition'
import FssFallback from "./FssFallback.vue";
import LogoBannerCoalition from "./LogoBannerCoalition.vue";
import { PropType } from "vue";
import { User } from "src/types/user";

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    default: null,
  }
});
</script>
