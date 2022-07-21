<template>
  <span>{{authStore.user}}</span>
  <q-page padding>
    <q-card>
      <pre>current name : {{authStore.user.name}}</pre>
      <q-input v-model="newName"></q-input>
      <q-btn @click="changeName(newName)">change name</q-btn>
    </q-card>
    <br>
    <q-card>
      <pre>current avatar :</pre>
      <img
        class="h-20 w-20 rounded-full"
        :src="authStore.user.avatar"
        style="max-width: 50%; max-height: 50%;"
      />
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';
import { Notify } from 'quasar';

const authStore = useAuthStore();
const newName = ref('');
const changeName = async (newName) => {
  try {
    await authStore.updateUser({name: newName});
  } catch ({ response, body}) {
    Notify.create({
      type: 'negative',
      message: (body as any).message,
    });
  }
}

</script>
