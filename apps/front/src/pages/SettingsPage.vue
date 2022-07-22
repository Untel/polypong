<template>
  <span>{{authStore.user}}</span>
  <q-page padding>
    <q-card>
      <pre>current name : {{authStore.user.name}}</pre>
      <q-input v-model="newName"></q-input>
      <q-btn @click="changeName(newName)">change name</q-btn>
    </q-card>
    <br>
    <q-card class="column flex-center">
      <pre class="self-start">current avatar :</pre>
      <q-img
        :src="authStore.user.avatar"
        style="max-width: 50%; max-height: 50%; border-radius: 15px;"
      />
      <q-uploader dark
        url="http://localhost:9999/user/setAvatar"
        accept=".jpg, image/*"
      />
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';
import { Notify } from 'quasar';

// name change
const authStore = useAuthStore();
const newName = ref('');
const changeName = async (newName) => {
  try {
    await authStore.updateUser({ name: newName });
  } catch ({ response, body }) {
    Notify.create({
      type: 'negative',
      message: (body as any).message,
    });
  }
};

</script>
