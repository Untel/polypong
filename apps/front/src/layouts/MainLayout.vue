<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Polypong
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      bordered
      mini-to-overlay

      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"

      :width="200"
      :breakpoint="500"
    >
      <Logo :size="miniState && '2rem' || '5rem'" />
      <q-list>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import Logo from 'src/components/Logo.vue';

const linksList = [
  {
    title: 'Home',
    caption: 'Home page',
    icon: 'fas fa-igloo',
    to: 'fas fa-igloo',
  },  {
    title: 'Login',
    caption: 'Login page',
    icon: 'fab fa-connectdevelop',
    to: 'login',
  },  {
    title: 'Coalitions',
    caption: 'Coalitions page',
    icon: 'fas fa-group-arrows-rotate',
    to: 'coalitions',
  },  {
    title: 'Lobbies',
    caption: 'Find a lobby of ppl to play with',
    icon: 'fab fa-forumbee',
    to: 'lobbies',
  },
];

const miniState = ref(true);
</script>
