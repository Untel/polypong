<style lang="scss" scoped>
  .coalition-box {
    height: 200px;
    width: 800px;
  }
</style>

<template setup>
  <q-page>
    <FssFallback
      v-for="coalition in coalitions"
      class="coalition-box"
      :fss-settings="coalition.shaderConfig"
      :fallback-url="coalition.fssFallback"
    >
      <div>{{ coalition.name }}</div>
    </FssFallback>
  </q-page>
</template>

<script lang="ts" setup>
import { CoalitionChoice, coalitions } from 'src/types';
import FssFallback from 'src/components/FssFallback.vue';
import { User } from 'src/types/user';

const defaultUser: User = {
  username: 'Untel',
  coalition: CoalitionChoice.ALLIANCE,
};

</script>
