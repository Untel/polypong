<template>
  <router-view />
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import { LoadingBar } from 'quasar'

defineComponent({
  name: 'App',
});

// LoadingBar.setDefaults({
//   color: 'purple',
//   size: '15px',
//   position: 'bottom',
//   hijackFilter (url: string) {
//     console.log('Testing url', url);
//     return true;
//     return /^http:\/\/localhost:3000/.test(url)
//   }
// });
// LoadingBar.start();
</script>
