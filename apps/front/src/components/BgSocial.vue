<style lang="scss">
  .social-fab {
    img {
      border-radius: 50%;
    }
    margin: 5px;
  }
</style>

<template>
      <!-- :label="props.name"
      external-label -->
  <q-fab
      class="social-fab"
      label-position="left"
      :icon="`img:https://cdn.intra.42.fr/users/${login}.jpg`"
      direction="up"
      padding="0"
    >
      <q-fab-action v-if="props.website" padding="5px" color="red"
        icon="public"
        :to="`/external?url=${props.website}`"
      />
      <q-fab-action v-if="props.linkedin" padding="5px" color="blue"
        icon="fab fa-linkedin"
        :to="`/external?url=https://profile.intra.42.fr/users/${props.linkedin}`"
      />
      <q-fab-action v-if="props.github" padding="5px"
        icon="fab fa-github" color="black"
        :to="`/external?url=https://github.com/${props.github}`"
      />
      <!-- <q-fab-action v-if="props.login" padding="0" red="black"
        :icon="`img:https://cdn.intra.42.fr/users/${login}.jpg`"
        :to="`https://profile.intra.42.fr/users/${props.login}`"
      /> -->
  </q-fab>
    <!-- <q-icon v-if="linkedin" color="primary" icon="linkedin" tag="a" :href="`https://linkedin.com/${linkedin}`" />
    <q-icon v-if="website" color="primary" icon="public" tag="a" :href="website" /> -->
</template>

<script setup>
import { defineComponent } from 'vue';

defineComponent({
  name: 'BgSocial',
});
const props = defineProps({
  name: String,
  github: String,
  website: String,
  linkedin: String,
  login: String,
});
</script>
