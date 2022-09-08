<style lang="scss">
  .social-fab {
    img {
      border-radius: 50%;
    }
    margin: 5px;

  }
</style>

<template>
  <q-fab
    :model-value="open"
    @update="emit('update:open', $event)"
    class="social-fab"
    label-position="left"
    :icon="`img:https://cdn.intra.42.fr/users/${login}.jpg`"
    direction="up"
    padding="0"
  >
    <q-fab-action v-if="props.website" padding="5px" color="red"
      icon="public"
      :to="external(`${props.website}`)"
    />
    <q-fab-action v-if="props.linkedin" padding="5px" color="blue"
      icon="fab fa-linkedin"
      :to="external(`https://www.linkedin.com/in/${props.linkedin}`)"
    />
    <q-fab-action v-if="props.github" padding="5px"
      icon="fab fa-github" color="black"
      :to="external(`https://github.com/${props.github}`)"
    />
    <q-fab-action v-if="props.login" padding="5px" color="black"
      icon="img:/42_logo.svg"
      :to="external(`https://profile.intra.42.fr/users/${props.login}`)"
    />
  </q-fab>
</template>

<script lang="ts" setup>
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
  open: Boolean,
});

const emit = defineEmits([
  'update:open',
]);

const external = (url: string) => ({ name: 'external', query: { url } });
</script>
