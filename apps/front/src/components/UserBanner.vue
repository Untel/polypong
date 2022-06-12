<style lang="scss" scoped>
  .wrapper {
    width: 100%;
    height: 100%;
  }
</style>

<template>
  <div class="wrapper">
    <FssFallback
      :fss-settings="coalitions[user.coalition || 'alliance'].shaderConfig"
      :fallback-url="coalitions[user.coalition || 'alliance'].fssFallback"
    >
      <div>
        <q-avatar>
          <img :src="user.avatar">
        </q-avatar>
        {{ user.name }}
        {{ user.email }}
      </div>
    </FssFallback>
  </div>
</template>

<script setup lang="ts">
import { CoalitionChoice } from "src/types/coalition"
import { coalitions } from 'src/types/coalition'
import FssFallback from "./FssFallback.vue";
import { PropType } from "vue";
import { User } from "src/types/user";

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    default: null,
  }
});
</script>
