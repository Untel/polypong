<template>

<q-tabs
  v-model="tab" dense class="text-grey" active-color="primary"
  indicator-color="primary" narrow-indicator
>
  <q-tab name="online" label="online"/>
  <q-tab name="browse" label="browse"/>
  <q-tab name="friends" label="friends"/>
  <q-tab name="blocked" label="blocked"/>
</q-tabs>

<q-separator />

<q-tab-panels v-model="tab" animated>

  <!-- ONLINE -->
  <q-tab-panel name="online">
    <q-card v-for="user in auth.getConnectedUsers" :key="`user-${user.id}`">
      <q-card-section>
        <div class="q-gutter-none">
          <q-avatar><img :src=user.avatar /></q-avatar>
          <q-btn :label=user.name @click="toggleGutter(user.name)"/>
          <span v-if="showGutter == user.name">
            <q-btn
              label="invite to lobby" @click="inviteToLobby(user.id)"
              icon="fa-solid fa-table-tennis-paddle-ball"
            /><q-btn
              label="message" @click="message(user.id)"
              icon="fa-solid fa-paper-plane"
            /><q-btn
              label="stats" @click="stats(user.id)"
              icon="fa-solid fa-chart-line"
            /><q-btn
              label="add friend" @click="addFriend(user.name)"
              icon="fa-solid fa-user-group"
            /><q-btn
              label="block" @click="block(user.id)"
              icon="fa-solid fa-ban" color="red"
            />
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-tab-panel>

  <!-- RELS -->
  <q-tab-panel name="browse">
    <q-input filled v-model="relName" label="Enter a name" stack-label dense>
      <template v-slot:append>
        <q-btn @click="addRel(relName)">search</q-btn>
      </template>
    </q-input>
    <q-card v-for="rel in soc.relationships" :key="`rel-${rel.id}`">
      <q-card-section>
        <div class="q-gutter-none">
          <q-avatar><img :src=rel.to.avatar /></q-avatar>
          <q-btn :label=rel.to.name @click="toggleGutter(rel.to.name)"
            :color="rel.friendship_received && rel.friendship_sent ? 'green' : ''"
          />
          <span v-if="showGutter == rel.to.name">
            <q-btn
              label="invite" @click="inviteToLobby(rel.to.id)"
              icon="fa-solid fa-table-tennis-paddle-ball"
            /><q-btn
              label="message" @click="message(rel.to.id)"
              icon="fa-solid fa-paper-plane"
            /><q-btn
              label="stats" @click="stats(rel.to.id)"
              icon="fa-solid fa-chart-line"
            /><q-btn v-if="rel.friendship_received == false && rel.friendship_sent == false"
              label="add friend" @click="addFriend(rel.to.name)"
              icon="fa-solid fa-user-group"
            />

            <q-btn-group
              v-if="rel.friendship_received == true && rel.friendship_sent == false"

            >
              <q-btn  label="accept" @click="addFriend(rel.to.name)"
                icon="fa-solid fa-heart" color="green"/>
              <q-btn label="decline" @click="unfriend(rel.to.name)"
                icon="fas fa-heart-broken" color="orange"/>
            </q-btn-group>

            <q-btn v-if="rel.friendship_sent == true && rel.friendship_received == false"
              label="cancel" @click="unfriend(rel.to.name)"
              icon="fa-solid fa-user" color="blue"
            /><q-btn v-if="rel.friendship_sent == true && rel.friendship_received == true"
              label="unfriend" @click="unfriend(rel.to.name)"
              icon="fas fa-sad-tear" color="orange"
            /><q-btn
              label="block" @click="block(rel.to.id)"
              icon="fa-solid fa-ban" color="red"
            />
          </span>
        </div>
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
import { useSocialStore } from 'src/stores/social.store';
import { ref } from 'vue';

const tab = ref('browse');
const showGutter = ref('');
function toggleGutter(name: string) {
  if (showGutter.value === name) { showGutter.value = ''; } else { showGutter.value = name; }
}
const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();

const relName = ref('');

async function inviteToLobby(id: number) {
  console.log(`invite to lobby ${id}`);
}
async function message(id: number) {
  console.log(`message ${id}`);
}
async function stats(id: number) {
  console.log(`stats ${id}`);
}
async function block(id: number) {
  console.log(`block ${id}`);
}
async function addRel(name: string) {
  console.log(`trying to add rel ${name}`);
  await soc.addRel(name);
}
async function addFriend(name: string) {
  console.log(`add friend ${name}`);
  await soc.send_friendship(name);
}
async function unfriend(name: string) {
  console.log(`unfriend ${name}`);
  await soc.unsend_friendship(name);
}

</script>

<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<i class="fa-solid fa-user-group"></i>
