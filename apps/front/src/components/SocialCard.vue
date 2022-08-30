<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 320px
  min-width: 320px
</style>

<template>
  <q-card v-if="rel" class="my-card" :label="rel.to.name">
    <div style="position: relative">
      <q-img :src="rel.to.avatar" height="280px" :ratio="4/3" fit="cover">
          <div class="absolute-top text-center text-weight-bolder">
            {{ rel.to.name }}
          </div>
      </q-img>
      <status-badge class="absolute-bottom-right" :id="rel.toId"/>
    </div>
    <q-separator />
      <q-card-actions align="around">
        <span>
          <span v-if="!rel.block_received && !rel.block_sent">&nbsp;
            <social-button
              @click="inviteToLobby(rel.toId)"
              :tooltip="'invite to lobby'"
              :icon="'fa-solid fa-table-tennis-paddle-ball'"
            />&nbsp;
            <social-button
              @click="message(rel.toId)"
              :tooltip="'message'" :icon="'fa-solid fa-paper-plane'"
            />&nbsp;
            <social-button
              @click="stats(rel.toId)"
              :tooltip="'stats'" :icon="'fa-solid fa-chart-line'"
            />&nbsp;
            <social-button
              v-if="rel.friendship_received == false && rel.friendship_sent == false"
              @click="addFriend(rel.to.name)"
              :tooltip="'add friend'" :icon="'fa-solid fa-user-group'"
            />&nbsp;
            <span v-if="rel.friendship_received && !rel.friendship_sent">
              <social-button
                @click="addFriend(rel.to.name)"
                :tooltip="'accept friend request'"
                :icon="'fa-solid fa-heart'" :color="'green'"
              />&nbsp;
              <social-button
                @click="unfriend(rel.to.name)"
                :tooltip="'decline friend request'"
                :icon="'fas fa-heart-broken'" :color="'orange'"
              />&nbsp;
            </span>
            <span v-if="rel.friendship_sent && !rel.friendship_received">
              <social-button v-if="rel.friendship_sent && !rel.friendship_received"
                @click="unfriend(rel.to.name)"
                :tooltip="'cancel friend request'"
                :icon="'fa-solid fa-user'" :color="'light-blue-10'"
              />&nbsp;
            </span>
            <span v-if="rel.friendship_sent && rel.friendship_received">
              <social-button v-if="rel.friendship_sent && rel.friendship_received"
                @click="unfriend(rel.to.name)"
                :tooltip="'unfriend'"
                :icon="'fas fa-sad-tear'" :color="'orange'"
              />&nbsp;
            </span>
          </span>
          <span v-if="rel.block_received">
            <social-button :label="'has blocked you'" :color="'red'"/>&nbsp;
          </span>
          <span v-if="!rel.block_sent">
          <social-button
            @click="block(rel.to.name)" :tooltip="'block this user'"
            :icon="'fa-solid fa-ban'" :color="'red'"
          />&nbsp;
          </span>
          <span v-if="rel.block_sent">
            <social-button v-if="rel.block_sent"
              @click="unblock(rel.to.name)" :tooltip="'unblock this user'"
              :icon="'fa-solid fa fa-unlock'" :color="'red-14'"
            />&nbsp;
          </span>
        </span>
      </q-card-actions>
  </q-card>
</template>

<script lang="ts" setup>
import {
  computed,
  ComputedRef,
  defineComponent, PropType, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { authApi, useAuthStore } from 'src/stores/auth.store';
import { User } from 'src/types/user';
import { onlineApi, useLobbiesStore } from 'src/stores/lobbies.store';
import { Relationship, useSocialStore } from '../stores/social.store';
import StatusBadge from './StatusBadge.vue';
import SocialButton from './SocialButton.vue';

const soc = useSocialStore();
const router = useRouter();
const auth = useAuthStore();
const lobbies = useLobbiesStore();

defineComponent({ name: 'SocialCard' });

const props = defineProps({
  relname: String,
});

const emit = defineEmits([
  'toggleGutter', 'inviteToLobby', 'message', 'stats',
  'addFriend', 'unfriend', 'block', 'unblock',
]);

const rel: ComputedRef<Relationship | undefined> = computed(() => soc.getRelByName(props.relname || ''));

const status: ComputedRef<'in game' | 'in lobby' | 'online' | 'offline' | ''> = computed(() => {
  if (!rel.value) return '';
  const user: User | undefined = auth.getConnectedUsers
    .find((u: User) => u.id === rel.value?.toId);
  if (!user) return 'offline';
  if (user.inGame) return 'in game';
  if (user.inLobby) return 'in lobby';
  return 'online';
});

function inviteToLobby(id: number) {
  // emit('inviteToLobby', id);
  if (status.value === 'offline' || status.value === 'in game') {
    // console.log('cannot invite, status = ', status);
    return;
  }
  // console.log('lobbies.activeLobby : ', lobbies.activeLobby);
  if (lobbies.activeLobby) {
    lobbies.inviteUserToLobby(id);
  }
}

async function message(id: number) { router.push(`/inbox/user/${id}`); }
async function stats(id: number) { router.push(`/profile/${id}`); }
async function addFriend(name: string) { await soc.send_friendship(name); }
async function unfriend(name: string) { await soc.unsend_friendship(name); }
async function block(name: string) { await soc.send_block(name); }
async function unblock(name: string) { await soc.unsend_block(name); }
// function addFriend(name: string) { emit('addFriend', name); }
// function unfriend(name: string) { emit('unfriend', name); }
// function block(name: string) { emit('block', name); }
// function unblock(name: string) { emit('unblock', name); }

</script>
