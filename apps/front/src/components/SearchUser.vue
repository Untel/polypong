<template>
  <!-- <q-select
    filled
    v-model="term"
    use-input
    hide-selected
    fill-input
    input-debounce="200"
    label="Search user"
    :options=""
    @filter="filterFn"
    @filter-abort="abortFilterFn"
    style="width: 250px"
    hint="Search users to invite"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
  </q-select> -->
</template>

<script lang="ts" setup>
import { useSocialStore } from 'src/stores/social.store';
import { ref } from 'vue';

const term = ref<string>();
const $social = useSocialStore();
</script>
