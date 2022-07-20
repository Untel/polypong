<template>
  <q-page padding>
    <q-card>
      Current name : {{authStore.user.name}}
      <q-input v-model="newName"></q-input>
      <q-btn @click="changeName(newName)">change name</q-btn>
      <!--
        <div v-if="authStore.error.area === 'updateName'" class="text-red-500">
          {{ authStore.error.message }}
        </div>
      -->
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';

const authStore = useAuthStore();
const newName = ref('');
const changeName = (newName) => {
  authStore.updateName({name: newName});
}

</script>
