<template>
  <q-card> <!-- 2FA -->
    <q-card-section>
      <h6> 2fa is required to proceed</h6>
      <h6> Enter the code provided by the Google Authenticator App</h6>
      <q-input
        label="6 digits code"
        v-model="code"
      >
      </q-input><br>
      <q-btn @click="authenticateCode(code)">authenticate</q-btn><br>
    </q-card-section>
  </q-card><br>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// 2fa
const code = ref('');
async function authenticateCode(value: any) {
  await authStore.authenticateCode(value);
  router.push({ name: 'home' });
}

</script>
