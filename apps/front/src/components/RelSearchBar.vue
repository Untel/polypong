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
import { computed, defineComponent, ref } from 'vue';
import { useSocialStore } from 'src/stores/social.store';

defineComponent({ name: 'RelSearchBar' });

const curRel = ref();
const soc = useSocialStore();

const relName = ref('');

const emit = defineEmits(['searched']);

async function searchRel(name: string) {
  curRel.value = soc.getRelByName(name);
  if (curRel.value === undefined) {
    await soc.addRel(name);
    curRel.value = soc.getRelByName(name);
  }
  emit('searched', name);
}

</script>
