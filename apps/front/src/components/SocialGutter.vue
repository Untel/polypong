<template>
  <div class="q-gutter-none" :class="toggle ? 'window-width' : ''">
    <q-avatar>
      <img :src="rel.to.avatar"/>
    </q-avatar>
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
  </div>
</template>

<script lang="ts" setup>
import { stringLiteral } from '@babel/types';
import { defineComponent, PropType, ref } from 'vue';
import { Relationship } from '../stores/social.store';
import StatusBadge from './StatusBadge.vue';

defineComponent({ name: 'SocialGutter' });
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
