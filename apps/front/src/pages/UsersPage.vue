<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<template>
<!--
<pre v-for="user in auth.getConnectedUsers" :key="`user-${user.id}`">
  {{ user }}
</pre>
-->

<q-tabs
  v-model="tab"
  dense
  class="text-grey"
  active-color="primary"
  indicator-color="primary"
  narrow-indicator
>
  <q-tab name="online" label="online"/>
  <q-tab name="friends" label="friends"/>
  <q-tab name="blocked" label="blocked"/>
</q-tabs>

<q-separator />

<q-tab-panels v-model="tab" animated>
  <q-tab-panel name="online">
    <div class="text-h6">online</div>
    Lorem ipsum dolor sit amet consectetur adipisicing elit.
  </q-tab-panel>

  <q-tab-panel name="friends">
    <div class="text-h6">friends</div>
    Lorem ipsum dolor sit amet consectetur adipisicing elit.
  </q-tab-panel>

  <q-tab-panel name="blocked">
    <div class="text-h6">blocked</div>
    Lorem ipsum dolor sit amet consectetur adipisicing elit.
  </q-tab-panel>
</q-tab-panels>

</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';

const auth = useAuthStore();
auth.fetchConnectedUsers();

const tab = ref('');

</script>
