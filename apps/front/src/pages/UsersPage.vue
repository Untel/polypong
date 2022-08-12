<template>

<q-tabs
  v-model="tab" dense class="text-grey" active-color="primary"
  indicator-color="primary" narrow-indicator
>
  <q-tab name="online" label="online"/>
  <q-tab name="friendlist" label="friendlist">
    <q-badge v-if="soc.getNotifCount" color="orange" rounded transparent floating>
      {{ soc.getNotifCount }}
    </q-badge>
  </q-tab>
  <q-tab name="blocklist" label="blocklist"/>
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
              label="block" @click="block(user.name)"
              icon="fa-solid fa-ban" color="red"
            />
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-tab-panel>

  <!-- FRIENDLIST -->
  <q-tab-panel name="friendlist">
    <pre>find people</pre>
    <rel-search-bar @add-friend="(name) => addFriend(name)"/>
    <pre>your rels</pre>
    <q-card v-for="rel in soc.getRelationships" :key="`rel-${rel.id}`">
      <q-card-section>
        <social-gutter :rel="rel"
          @invite-to-lobby="(id) => inviteToLobby(id)"
          @message="(id) => message(id)"
          @stats="(id) => stats(id)"
          @add-friend="(name) => addFriend(name)"
          @unfriend="(name) => unfriend(name)"
          @block="(name) => block(name)"
          @unblock="(name) => unblock(name)"
        />
      </q-card-section>
    </q-card>
    <pre v-if="soc.getFriendsRelationships.length">your friends</pre>
    <q-card label="friends" v-for="rel in soc.getFriendsRelationships" :key="`rel-${rel.id}`">
      <q-card-section>
        <social-gutter :rel="rel"
          @invite-to-lobby="(id) => inviteToLobby(id)"
          @message="(id) => message(id)"
          @stats="(id) => stats(id)"
          @add-friend="(name) => addFriend(name)"
          @unfriend="(name) => unfriend(name)"
          @block="(name) => block(name)"
          @unblock="(name) => unblock(name)"
        />
      </q-card-section>
    </q-card>
    <pre v-if="soc.getReceivedFriendships.length">friend requests received</pre>
    <q-card label="received" v-for="rel in soc.getReceivedFriendships" :key="`rel-${rel.id}`">
      <q-card-section>
        <social-gutter :rel="rel"
          @invite-to-lobby="(id) => inviteToLobby(id)"
          @message="(id) => message(id)"
          @stats="(id) => stats(id)"
          @add-friend="(name) => addFriend(name)"
          @unfriend="(name) => unfriend(name)"
          @block="(name) => block(name)"
          @unblock="(name) => unblock(name)"
        />
      </q-card-section>
    </q-card>
    <pre v-if="soc.getSentFriendships.length">friend requests sent</pre>
    <q-card label="received" v-for="rel in soc.getSentFriendships" :key="`rel-${rel.id}`">
      <q-card-section>
        <social-gutter :rel="rel"
          @invite-to-lobby="(id) => inviteToLobby(id)"
          @message="(id) => message(id)"
          @stats="(id) => stats(id)"
          @add-friend="(name) => addFriend(name)"
          @unfriend="(name) => unfriend(name)"
          @block="(name) => block(name)"
          @unblock="(name) => unblock(name)"
        />
      </q-card-section>
    </q-card>
  </q-tab-panel>

  <!-- BLOCKLIST -->
  <q-tab-panel name="blocklist">
    <div class="text-h6">blocked</div>
    <q-card v-for="rel in soc.getBlockSentRelations" :key="`rel-${rel.id}`">
      <q-card-section>
        <div class="q-gutter-none">
          <q-avatar><img :src=rel.to.avatar /></q-avatar>
          <q-btn :label=rel.to.name @click="toggleGutter(rel.to.name)"
            :color=friendOrNot(rel)
          />
          <span v-if="showGutter == rel.to.name">
            <q-btn v-if="rel.block_sent" label="unblock"
              @click="unblock(rel.to.name)" icon="fa-solid fa fa-unlock" color="red"
            />
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-tab-panel>
</q-tab-panels>

</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Relationship, useSocialStore } from 'src/stores/social.store';
import { ref } from 'vue';
import SocialGutter from 'src/components/SocialGutter.vue';
import RelSearchBar from 'src/components/RelSearchBar.vue';

const tab = ref('friendlist');
const showGutter = ref('');
function toggleGutter(name: string) {
  if (showGutter.value === name) { showGutter.value = ''; } else { showGutter.value = name; }
}
function friendOrNot(rel: Relationship): string {
  if (rel.friendship_sent && rel.friendship_received) { return 'green'; }
  if (rel.block_sent || rel.block_received) { return 'red'; }
  return '';
}

const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();

async function inviteToLobby(id: number) {
  console.log(`invite to lobby ${id}`);
}
async function message(id: number) {
  console.log(`message ${id}`);
}
async function stats(id: number) {
  console.log(`stats ${id}`);
}
async function addFriend(name: string) { await soc.send_friendship(name); }
async function unfriend(name: string) { await soc.unsend_friendship(name); }
async function block(name: string) { await soc.send_block(name); }
async function unblock(name: string) { await soc.unsend_block(name); }

</script>

<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<i class="fa-solid fa-user-group"></i>
