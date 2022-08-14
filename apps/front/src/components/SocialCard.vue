<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 320px
  min-width: 320px
</style>

<template>
  <q-card class="my-card" :label="rel.to.name">
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

<!--
    <q-btn :label=rel.to.name @click="toggleGutter(rel.to.name)">
      <status-badge :id="rel.toId"/>
    </q-btn>
    <span v-if="toggle">
      <span v-if="!rel.block_received && !rel.block_sent">
        <q-btn
          label="invite" @click="inviteToLobby(rel.toId)"
          icon="fa-solid fa-table-tennis-paddle-ball"
        /><q-btn
          label="message" @click="message(rel.toId)"
          icon="fa-solid fa-paper-plane"
        /><q-btn
          label="stats" @click="stats(rel.toId)"
          icon="fa-solid fa-chart-line"
        /><q-btn v-if="rel.friendship_received == false && rel.friendship_sent == false"
          label="add friend" @click="addFriend(rel.to.name)"
          icon="fa-solid fa-user-group"
        />

        <q-btn-group v-if="rel.friendship_received && !rel.friendship_sent">
          <q-btn  label="accept" @click="addFriend(rel.to.name)"
            icon="fa-solid fa-heart" color="green"/>
          <q-btn label="decline" @click="unfriend(rel.to.name)"
            icon="fas fa-heart-broken" color="orange"/>
        </q-btn-group>

        <q-btn v-if="rel.friendship_sent && !rel.friendship_received"
          label="cancel" @click="unfriend(rel.to.name)"
          icon="fa-solid fa-user" color="blue"
        /><q-btn v-if="rel.friendship_sent && rel.friendship_received"
          label="unfriend" @click="unfriend(rel.to.name)"
          icon="fas fa-sad-tear" color="orange"
        />
      </span><span v-if="rel.block_received">
        <q-btn label="has blocked you" color="red"/>
      </span>
      <q-btn v-if="!rel.block_sent" label="block"
        @click="block(rel.to.name)" icon="fa-solid fa-ban" color="red"
      /><q-btn v-if="rel.block_sent" label="unblock"
        @click="unblock(rel.to.name)" icon="fa-solid fa fa-unlock" color="red"
      />
    </span>
-->
  </q-card>
</template>

<script lang="ts" setup>
import { stringLiteral } from '@babel/types';
import { defineComponent, PropType, ref } from 'vue';
import { Relationship } from '../stores/social.store';
import StatusBadge from './StatusBadge.vue';
import SocialButton from './SocialButton.vue';

defineComponent({ name: 'SocialCard' });
defineProps({
  rel: {
    type: Object as PropType<Relationship>,
    default: null,
  },
  toggle: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'toggleGutter', 'inviteToLobby', 'message', 'stats',
  'addFriend', 'unfriend', 'block', 'unblock',
]);

function friendOrNot(rel: Relationship): string {
  if (rel.friendship_sent && rel.friendship_received) { return 'green'; }
  if (rel.block_sent || rel.block_received) { return 'red'; }
  return '';
}

const showGutter = ref('');
const toggleWidth = ref('0');

function toggleGutter(name: string) {
  showGutter.value = (showGutter.value === name ? '' : name);
  toggleWidth.value = showGutter.value ? '1' : '0';
  console.log(`emitting toggleGutter event, name = ${showGutter.value}`);
  emit('toggleGutter', showGutter.value);
}

function inviteToLobby(id: number) { emit('inviteToLobby', id); }
function message(id: number) { emit('message', id); }
function stats(id: number) { emit('stats', id); }
function addFriend(name: string) { emit('addFriend', name); }
function unfriend(name: string) { emit('unfriend', name); }
function block(name: string) { emit('block', name); }
function unblock(name: string) { emit('unblock', name); }

</script>
