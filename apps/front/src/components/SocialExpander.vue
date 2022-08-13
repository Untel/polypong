<template>
  <div class="q-pa-md" style="max-width: 350px">
    <q-list bordered class="rounded-borders">
      <q-expansion-item
        expand-separator
        icon="mail"
        label="Inbox"
        caption="5 unread emails"
        default-opened
      >
        <q-expansion-item
          :header-inset-level="1"
          expand-separator
          icon="receipt"
          label="Receipts"
          default-opened
        >

          <q-expansion-item
            switch-toggle-side dense-toggle label="Today"
            :header-inset-level="1" :content-inset-level="2"
          >
            <q-card>
              <q-card-section>
                Lorem ipsum dolor sit amet
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item
            switch-toggle-side dense-toggle label="Yesterday"
            :header-inset-level="1" :content-inset-level="2"
          >
            <q-card>
              <q-card-section>
                Lorem ipsum dolor sit amet
              </q-card-section>
            </q-card>
          </q-expansion-item>

        </q-expansion-item>

        <q-expansion-item
          :header-inset-level="1" :content-inset-level="1"
          expand-separator icon="schedule" label="Postponed"
        >
          <q-card>
            <q-card-section>
              Lorem ipsum dolor sit amet
            </q-card-section>
          </q-card>
        </q-expansion-item>

      </q-expansion-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, PropType, ref } from 'vue';
import { Relationship } from '../stores/social.store';

defineComponent({ name: 'SocialExpander' });
defineProps({
  rel: {
    type: Object as PropType<Relationship>,
    default: null,
  },
});

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
