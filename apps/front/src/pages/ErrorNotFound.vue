<style lang="scss" scoped>
  .error-page {
    min-height: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inner {
  }
</style>

<template>
  <q-page>
    <FssFallback class="error-page">
      <div class="inner">
        <div style="font-size: 30vh">
          404
        </div>

        <div class="text-h2" style="opacity:.4">
          Oops. Nothing here...
        </div>

        <q-btn
          class="q-mt-xl"
          color="white"
          text-color="primary"
          to="/"
          label="Go Home"
        />
      </div>
    </FssFallback>
  </q-page>

</template>

<script lang="ts" setup>
import FssFallback from 'src/components/FssFallback.vue';

</script>
