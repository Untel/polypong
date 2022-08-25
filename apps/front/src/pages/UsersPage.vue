<template>

<q-tabs
  v-model="tab" dense class="text-grey" active-color="primary"
  indicator-color="primary" narrow-indicator
>
  <q-tab name="search" label="search"/>
  <q-tab name="friendlist" label="friendlist">
    <q-badge v-if="soc.getNotifCount" color="orange" rounded transparent floating>
      {{ soc.getNotifCount }}
    </q-badge>
  </q-tab>
  <q-tab name="blocklist" label="blocklist"/>
</q-tabs>

<q-separator />

<q-tab-panels v-model="tab" animated>

  <!-- SEARCH -->
  <q-tab-panel name="search">
    <q-card v-if="auth.getConnectedUsers.length > 1">
      <pre>online users</pre>
      <q-card-section horizontal>
        <div class="q-pa-md row items-start q-gutter-md"
          v-for="user in auth.getConnectedUsers" :key="`user-${user.id}`"
        >
          <social-avatar v-if="user.id !== auth.getUser.id"
            :id="user.id" :name="user.name" :avatar="user.avatar"
            @avatarClick="(name) => {
              if (soc.getSearchedRel?.to.name === name) {
                soc.setSearchedRel(undefined);
              } else {
                searchRel(name);
              }
            }"
          />
        </div>
      </q-card-section>
    </q-card>
    <pre>find people</pre>
    <rel-search-bar/>
    <!-- SEARCH RESULTS -->
    <q-card v-if="soc.getSearchedRel">
      {{ soc.getSearchedRel }}
      <pre>search results</pre>
        <social-card :relname="soc.getSearchedRel.to.name"
          @toggle-gutter="(name) => toggleCard(name)"
          @invite-to-lobby="(id) => inviteToLobby(id)"
          @message="(id) => message(id)"
          @stats="(id) => stats(id)"
          @add-friend="(name) => addFriend(name)"
          @unfriend="(name) => unfriend(name)"
          @block="(name) => block(name)"
          @unblock="(name) => unblock(name)"
        />
    </q-card>
  </q-tab-panel>
  <!-- FRIENDLIST -->
  <q-tab-panel name="friendlist">
<!-- rels (TEMP, for debug purposes)
    <pre>rels</pre>
    <q-card>
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card-section
            v-for="rel in soc.getRelationships" :key="`rel-${rel.id}`" horizontal
          >
            <social-card :rel="rel" :toggle="showCard === rel.to.name ? true : false"
              @toggle-gutter="(name) => toggleCard(name)"
              @invite-to-lobby="(id) => inviteToLobby(id)"
              @message="(id) => message(id)"
              @stats="(id) => stats(id)"
              @add-friend="(name) => addFriend(name)"
              @unfriend="(name) => unfriend(name)"
              @block="(name) => block(name)"
              @unblock="(name) => unblock(name)"
            />
          </q-card-section>
        </div>
    </q-card>
-->
    <!-- actual friends -->
    <q-card v-if="soc.getFriendsRelationships.length" label="friends">
      <pre>your friends</pre>
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card-section
            v-for="rel in soc.getFriendsRelationships" :key="`rel-${rel.id}`" horizontal
          >
            <social-card :relname="rel.to.name"
              @toggle-gutter="(name) => toggleCard(name)"
              @invite-to-lobby="(id) => inviteToLobby(id)"
              @message="(id) => message(id)"
              @stats="(id) => stats(id)"
              @add-friend="(name) => addFriend(name)"
              @unfriend="(name) => unfriend(name)"
              @block="(name) => block(name)"
              @unblock="(name) => unblock(name)"
            />
          </q-card-section>
        </div>
    </q-card>
    <!-- received friends invites -->
    <q-card v-if="soc.getReceivedFriendships.length" label="received">
      <pre>friend requests received</pre>
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card-section
            v-for="rel in soc.getReceivedFriendships" :key="`rel-${rel.id}`" horizontal
          >
            <social-card :relname="rel.to.name"
              @toggle-gutter="(name) => toggleCard(name)"
              @invite-to-lobby="(id) => inviteToLobby(id)"
              @message="(id) => message(id)"
              @stats="(id) => stats(id)"
              @add-friend="(name) => addFriend(name)"
              @unfriend="(name) => unfriend(name)"
              @block="(name) => block(name)"
              @unblock="(name) => unblock(name)"
            />
          </q-card-section>
        </div>
    </q-card>
    <!-- sent friends invites -->
    <q-card v-if="soc.getSentFriendships.length" label="sent">
      <pre>friend requests sent</pre>
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card-section
            v-for="rel in soc.getSentFriendships" :key="`rel-${rel.id}`" horizontal
          >
            <social-card :relname="rel.to.name"
              @toggle-gutter="(name) => toggleCard(name)"
              @invite-to-lobby="(id) => inviteToLobby(id)"
              @message="(id) => message(id)"
              @stats="(id) => stats(id)"
              @add-friend="(name) => addFriend(name)"
              @unfriend="(name) => unfriend(name)"
              @block="(name) => block(name)"
              @unblock="(name) => unblock(name)"
            />
          </q-card-section>
        </div>
    </q-card>
  </q-tab-panel>

  <!-- BLOCKLIST -->
  <q-tab-panel name="blocklist">
    <pre v-if="!soc.getBlockSentRelations.length">people you blocked will be displayed here</pre>
    <q-card v-for="rel in soc.getBlockSentRelations" :key="`rel-${rel.id}`">
      <q-card-section>
        <div class="q-gutter-none">
          <q-avatar><img :src=rel.to.avatar /></q-avatar>
          <q-btn :label=rel.to.name @click="toggleCard(rel.to.name)"
            :color=friendOrNot(rel)
          />
          <q-btn v-if="rel.block_sent" label="unblock"
            @click="unblock(rel.to.name)" icon="fa-solid fa fa-unlock" color="red"
          />
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
import RelSearchBar from 'src/components/RelSearchBar.vue';
import SocialCard from 'src/components/SocialCard.vue';
import SocialAvatar from 'src/components/SocialAvatar.vue';
import { useRouter } from 'vue-router';

const tab = ref('friendlist');
const showCard = ref('');
function toggleCard(name: string) {
  console.log(`caught toggleCard event, name = ${name}`);
  if (showCard.value === name) { showCard.value = ''; } else { showCard.value = name; }
}
function friendOrNot(rel: Relationship): string {
  if (rel.friendship_sent && rel.friendship_received) { return 'green'; }
  if (rel.block_sent || rel.block_received) { return 'red'; }
  return '';
}

const auth = useAuthStore(); auth.fetchConnectedUsers();
const soc = useSocialStore(); soc.fetchRelationships();
const router = useRouter();

async function inviteToLobby(id: number) {
  console.log(`invite to lobby ${id}`);
}
async function message(id: number) {
  console.log(`message ${id}`);
}
async function stats(id: number) {
  router.push(`/profile/${id}`);
}
async function addFriend(name: string) { await soc.send_friendship(name); }
async function unfriend(name: string) { await soc.unsend_friendship(name); }
async function block(name: string) { await soc.send_block(name); }
async function unblock(name: string) { await soc.unsend_block(name); }

// const searchedRel = ref(); searchedRel.value = null;
async function searchRel(name: string) {
  console.log('in searchRel, name = ', name);
  const rel = soc.getRelByName(name);
  if (rel === undefined) {
    await soc.addRel(name);
    soc.setSearchedRel(soc.getRelByName(name));
    //    searchedRel.value = soc.getRelByName(name);
    console.log('1searchedRel = ', soc.getSearchedRel);
  } else {
    soc.setSearchedRel(rel);
    //    searchedRelvalue = rel;
  }
  console.log('2searchedRel = ', soc.getSearchedRel);
  console.log('2soc.getSearchedRel= ', soc.getSearchedRel);
}

</script>

<style scoped lang="scss">
  .wrapper {
    width: 100%;
    height: 300px;
  }
</style>

<i class="fa-solid fa-user-group"></i>
