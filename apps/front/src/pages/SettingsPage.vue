<template>
  <span>{{authStore.user}}</span>
  <q-page padding>
    <q-card> <!-- NAME CHANGE -->
      <q-card-section>
        <pre>current name : {{authStore.user.name}}</pre>
        <q-input v-model="newName"></q-input>
        <q-btn @click="changeName(newName)">change name</q-btn>
      </q-card-section>
    </q-card><br>

    <q-card> <!-- 2FA -->
      <q-card-section>
        <q-div v-if="authStore.user.isTwoFactorAuthenticationEnabled === true">
          <pre> 2fa is required </pre>
          <q-btn @click="turnOff2fa()">turn off 2fa</q-btn><br>
        </q-div><q-div v-else>
          <pre> 2fa is not required </pre>
          <q-btn @click="requestQrCode()">request QrCode</q-btn><br>
          <q-img :src=qrCode.imageBytes width="50%"></q-img><br>
          <q-input
            label="Scan with Google Authenticator and enter code here"
            v-model="qrCode.decoded"
          >
            <template v-slot:append>
              <q-btn @click="activate2fa(qrCode.decoded)">activate 2FA</q-btn><br>
            </template>
          </q-input><br>
        </q-div>
      </q-card-section>
    </q-card><br>

    <q-card> <!-- AVATAR -->
      <q-card-section class="column flex-center">
        <pre class="self-start">current avatar :</pre>
        <q-img
          :src="authStore.user.avatar"
          style="max-width: 50%; max-height: 50%; border-radius: 15px;"
        />
        <q-uploader
          dark accept="image/*" :factory="factoryFn" field-name="avatar"
          @finish="authStore.fetchUser()"
        />
      </q-card-section>
    </q-card><br>

    <q-card> <!-- LOGOUT -->
      <q-card-section class="column flex-center">
          <q-btn @click="logOut()" color="red">LOGOUT</q-btn><br>
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

// name change
const newName = ref('');
const changeName = async (name) => {
  try {
    await authStore.updateUser({ name });
  } catch ({ response, body }) {
    Notify.create({
      type: 'negative',
      message: (body as any).message,
    });
  }
};

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
async function turnOff2fa() {
  await authStore.updateUser({ isTwoFactorAuthenticationEnabled: false });
  qrCode.value.imageBytes = ''; qrCode.value.decoded = '';
}
async function activate2fa(value: any) {
  try {
    await authStore.activate2fa(value);
    router.push({ name: '2fa' });
  } catch ({ response, body }) {
    Notify.create({
      type: 'negative',
      message: (body as any).message,
    });
  }
}

// avatar change
function factoryFn(file: any): Promise<any> {
  console.log(`user before update = ${JSON.stringify(authStore.user)}`);
  return new Promise((resolve, reject) => {
    // Retrieve JWT token from your store.
    resolve({
      url: '/api/user/setAvatar',
      method: 'POST',
      headers: [
        { name: 'Authorization', value: `Bearer ${localStorage.getItem('token')}` },
      ],
    });
  });
}

// logout
function logOut(): void {
  authStore.killws();
  localStorage.removeItem('token');
  router.push({ name: 'login' });
}

</script>
