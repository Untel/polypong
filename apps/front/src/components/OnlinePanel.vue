<style lang="scss" scoped>
  .online-panel {
  }
</style>

<template>
  <q-tab-panel class="online-panel" name="online">
    <pre> users = {{ users }}</pre>
    <!--
      <q-div v-for="user in users" :key="`user-${user.id}`">
        <q-div class="q-gutter-x-md">
          <q-avatar><img :src=user.avatar /></q-avatar>
          <q-btn-dropdown color="primary" :label=user.name>
            <q-list>
              <q-item clickable v-close-popup @click="addFriend()">
                <q-item-section>
                  <q-item-label>add friend</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="message()">
                <q-item-section>
                  <q-item-label>message</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="userAvailable === true"
                clickable v-close-popup @click="inviteToLobby()">
                <q-item-section>
                  <q-item-label>invite to lobby</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-div>
      </q-div>
    -->
  </q-tab-panel>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';

defineComponent({});
defineProps({
  users: [Object],
});

const userAvailable = true;

async function addFriend() {
  console.log('addfriend');
}
async function message() {
  console.log('addfriend');
}
async function inviteToLobby() {
  console.log('addfriend');
}

</script>
