<template>
  <q-item
    clickable
    tag="a"
    :to="{ name: to || '/' }"
    exact
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
      <q-badge v-if="notif != 0" color="red" floating>
        {{ notif }}
      </q-badge>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { number } from '@intlify/core-base';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EssentialLink',
  notifCount: 0,
  props: {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '#',
    },
    to: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'icon',
    },
    notif: {
      type: Number,
      default: 0,
    },
  },
});
</script>
