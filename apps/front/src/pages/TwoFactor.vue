<template>
  <q-page padding>
    <span>{{authStore.user}}</span>

    <q-card> <!-- 2FA -->
      <q-card-section>
          <pre> 2fa is required to proceed</pre>
          <q-btn @click="requestQrCode()">refresh QrCode</q-btn><br>
          <q-img :src=qrCode.imageBytes width="50%"></q-img><br>
          <q-input
            label="Scan with Google Authenticator and enter code here"
            v-model="qrCode.decoded"
          >
            <template v-slot:append>
              <q-btn @click="authenticateQrCode(qrCode.decoded)">authenticate</q-btn><br>
            </template>
          </q-input><br>
      </q-card-section>
    </q-card><br>

  </q-page>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// 2fa
const qrCode = ref({
  requested: false,
  imageBytes: '',
  decoded: '',
});
async function requestQrCode() {
  const res: any = await authStore.requestQrCode();
  qrCode.value.requested = true;
  qrCode.value.imageBytes = res.qrAsDataUrl;
}
async function authenticateQrCode(value: any) {
  await authStore.authenticateQrCode(value);
}

</script>
