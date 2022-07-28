<template>
  <span>{{authStore.user}}</span>
  <q-page padding>
    <q-card> <!-- NAME CHANGE -->
      <pre>current name : {{authStore.user.name}}</pre>
      <q-input v-model="newName"></q-input>
      <q-btn @click="changeName(newName)">change name</q-btn>
    </q-card>

    <br>
    <q-card> <!-- 2FA -->
      <q-div v-if="authStore.user.isTwoFactorAuthenticationEnabled === true">
        <pre>2fa is required</pre>
        <q-btn @click="turnOff2fa()">turn off 2fa</q-btn>
      </q-div><q-div v-else>
        <pre>2fa not required</pre>
        <q-btn @click="turnOn2fa()">turn on 2fa</q-btn>
      </q-div>
      <br>
      <!-- <q-div>{{qrCode}}</q-div> -->
      <pre>QrCode requested : {{qrCode.requested}}</pre>
      <pre>QrCode data : {{qrCode.imageBytes}}</pre>
      <!-- <pre class="self-start">current qrcode :</pre> -->
      <img style="max-width: 50%; max-height: 50%; border-radius: 15px;" id="newImage"/>
     <!-- <q-img data={{qrCode.imageBytes}}/> -->
      <!-- <img src={{qrCode.imageBytes}} /> -->
      <q-btn @click="requestQrCode()">request QrCode</q-btn>
      <!-- <img 
        src={{qrCode.imageBytes.a}}
      /> -->


      

    </q-card>

    <br>

    <q-card class="column flex-center"> <!-- AVATAR -->
      <pre class="self-start">current avatar :</pre>
      <q-img
        :src="authStore.user.avatar"
        style="max-width: 50%; max-height: 50%; border-radius: 15px;"
      />
      <q-uploader
        dark accept="image/*" :factory="factoryFn" field-name="avatar"
        @finish="authStore.fetchUser()"
      />
    </q-card>
    <br>
  </q-page>
</template>

<script lang="ts" setup>
import { twoFactorApi, useAuthStore } from 'src/stores/auth.store';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// name change
const newName = ref('');
const new2fa = ref('');
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

// 2fa
async function turnOn2fa() {
  await authStore.updateUser({ isTwoFactorAuthenticationEnabled: true });
}
async function turnOff2fa() {
  await authStore.updateUser({ isTwoFactorAuthenticationEnabled: false });
}
const qrCode = ref({
  requested: false,
  imageBytes: '',
});

async function requestQrCode() {
  // try {
    console.log("Getting QR");
    let oData: any;
    let res: any = await twoFactorApi.get('generate').then(data => 
    {
      console.log("we got this", data);
      oData = data; 
      qrCode.requested = true;
      qrCode.imageBytes = oData.out;
    })
    document.getElementById("newImage").src = qrCode.imageBytes
    // new2fa.value = qrCode.imageBytes
    // res.resolve();
    // console.log("RES IS", oData);
    // console.log(`SettingsPage - requestQrCode - after query - res = ${console.dir(res)}`);

    console.log("qRCode ", qrCode, ";")

    console.log("image data :",qrCode.imageBytes)
    //    qrCode.imageBytes = res.data;
  // } catch (error) {
  // var img = document.createElement('img');
  // img.src = oData;
  // document.body.appendChild(img);
    // console.log("failed : ", error);
  // }
}

// avatar change
function factoryFn(file: any): Promise<any> {
  console.log(`user before update = ${JSON.stringify(authStore.user)}`);
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
