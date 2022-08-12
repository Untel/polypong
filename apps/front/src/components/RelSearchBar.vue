<template>
  <q-card>
    <q-card-section>
      <q-input
        filled v-model="relName" label="Enter a name"
        @keydown.enter.prevent="searchRel(relName)"
        stack-label dense>
        <template v-slot:append>
          <q-btn @click="searchRel(relName)">search</q-btn>
        </template>
      </q-input>
    </q-card-section>
    <q-card-section v-if="curRel">
      <social-gutter :rel="curRel"
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
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';
import { useSocialStore } from 'src/stores/social.store';
import SocialGutter from 'src/components/SocialGutter.vue';

defineComponent({ name: 'RelSearchBar' });

const relName = ref(''); const curRel = ref();
const soc = useSocialStore();

async function searchRel(name: string) {
  curRel.value = soc.getRelByName(name);
  if (curRel.value === undefined) {
    console.log('could not find rel locally, calling API');
    await soc.addRel(name);
    curRel.value = soc.getRelByName(name);
  } else {
    console.log('found rel locally');
  }
}

const emit = defineEmits([
  'inviteToLobby', 'message', 'stats', 'addFriend', 'unfriend', 'block', 'unblock',
]);

function inviteToLobby(id: number) { emit('inviteToLobby', id); }
function message(id: number) { emit('message', id); }
function stats(id: number) { emit('stats', id); }
function addFriend(name: string) { emit('addFriend', name); }
function unfriend(name: string) { emit('unfriend', name); }
function block(name: string) { emit('block', name); }
function unblock(name: string) { emit('unblock', name); }

</script>
