<template>

<q-tabs
  v-model="tab" dense class="text-grey" active-color="primary"
  indicator-color="primary" narrow-indicator
>
  <q-tab name="online" label="online"/>
  <q-tab name="friends" label="friends"/>
  <q-tab name="blocked" label="blocked"/>
</q-tabs>

<q-separator />

<q-tab-panels v-model="tab" animated>

  <q-tab-panel name="online">
    <q-card v-for="user in auth.getConnectedUsers" :key="`user-${user.id}`">
      <q-card-section>
        <q-avatar><img :src=user.avatar /></q-avatar>
        <q-btn-group push>
          <q-btn :label=user.name @click="toggleGutter(user.name)"/>
          <q-btn v-if="showGutter === user.name"
            label="invite to lobby" @click="inviteToLobby(user.id)"
            push icon="fa-solid fa-table-tennis-paddle-ball"
          />
          <q-btn v-if="showGutter == user.name"
            label="message" @click="message(user.id)"
            push icon="fa-solid fa-paper-plane" />
          <q-btn v-if="showGutter == user.name"
            label="add friend" @click="addFriend(user.id)"
            push icon="fa-solid fa-user-group"
          />
          <q-btn v-if="showGutter == user.name"
            label="block" @click="block(user.id)"
            push icon="fa-solid fa-ban"
          />
        </q-btn-group>
      </q-card-section>
    </q-card>
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
import { sortUserPlugins } from 'vite';
import { ref, defineComponent } from 'vue';

const auth = useAuthStore();
auth.fetchConnectedUsers();
const tab = ref('online');

const showGutter = ref('');
function toggleGutter(name: string) {
  if (showGutter.value === name) { showGutter.value = ''; } else { showGutter.value = name; }
}

async function inviteToLobby(id: number) {
  console.log(`invite to lobby ${id}`);
}
async function addFriend(id: number) {
  console.log(`add friend ${id}`);
}
async function block(id: number) {
  console.log(`block ${id}`);
}
async function message(id: number) {
  console.log(`message ${id}`);
}

</script>

<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<i class="fa-solid fa-user-group"></i>
