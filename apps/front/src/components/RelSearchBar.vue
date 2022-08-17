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
  </q-card>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';
import { useSocialStore } from 'src/stores/social.store';

defineComponent({ name: 'RelSearchBar' });

const soc = useSocialStore();
const relName = ref('');

const emit = defineEmits(['searched']);

const searchedRel = ref();
async function searchRel(name: string) {
  searchedRel.value = soc.getRelByName(name);
  if (searchedRel.value === undefined) {
    await soc.addRel(name);
    searchedRel.value = soc.getRelByName(name);
  }
  soc.setSearchedRel(searchedRel.value);
  emit('searched');
}

</script>
