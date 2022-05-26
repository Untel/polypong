<style lang="scss" scoped>
  .wrapper {
    width: 100%;
    height: 100%;
  }
</style>

<template>
  <div class="wrapper">
    <FssFallback
      :fss-settings="coalitions[coalition].shaderConfig"
      :fallback-url="coalitions[coalition].fssFallback"
    >
      <div>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/avatar.png">
        </q-avatar>
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
  coalition: {
    type: String as PropType<CoalitionChoice>,
    default: CoalitionChoice.ALLIANCE
  },
  user: {
    type: Object as PropType<User>,
    default: null,
  }
});
</script>