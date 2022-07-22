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
      <q-uploader
        dark accept="image/*" :factory="factoryFn" field-name="avatar"
        @finish="authStore.whoAmI"
        />
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { onMounted, ref } from 'vue';
import { Notify } from 'quasar';

const authStore = useAuthStore();

// name change
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

// avatar change
function factoryFn(file: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Retrieve JWT token from your store.
    resolve({
      url: 'http://localhost:9999/api/user/setAvatar',
      method: 'POST',
      headers: [
        { name: 'Authorization', value: `Bearer ${localStorage.getItem('token')}` },
      ],
    });
  });
}

</script>
