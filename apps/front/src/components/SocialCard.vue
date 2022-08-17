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
  defineComponent, PropType, ref, watch,
} from 'vue';
import { stringLiteral } from '@babel/types';
import { Relationship, useSocialStore } from '../stores/social.store';
import StatusBadge from './StatusBadge.vue';
import SocialButton from './SocialButton.vue';

const soc = useSocialStore();

defineComponent({ name: 'SocialCard' });

const props = defineProps({
  relname: String,
});

const emit = defineEmits([
  'toggleGutter', 'inviteToLobby', 'message', 'stats',
  'addFriend', 'unfriend', 'block', 'unblock',
]);

const rel = computed(() => soc.getRelByName(props.relname || ''));

console.log('in socialCard, props.relname = ', props.relname);
console.log('in socialCard, rel = ', rel);
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
