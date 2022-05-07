<style lang="scss" scoped>
  .login-background {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .login-form {
    display: flex;
    flex-direction: column;
    place-items: center;
    width: min(400px, 60%);
  }
</style>

<template>
  <!-- <q-img :src="getFullUrl('/src/assets/background_login.jpg')"></q-img> -->
  <FssFallback
    class="login-background"
    :fss-settings="loginShaders"
    fallback-url="/src/assets/background_login.jpg"
  >
    <q-form
      ref="form"
      dark center
      class="q-gutter-md login-form"
      @submit="onSubmitForm"
      aria-autocomplete="off"
    >
      <!-- <pre>Low perf: {{ settings.getIsLowPerf }}</pre> -->
      <img style="width:100px; justify-self: center;" src="src/assets/42_logo.svg"/>
      <q-input
        v-model="login"
        class="full-width"
        filled
        dark
        label="Login"
        hint="Username or email"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />
      <q-input
        v-model="password"
        class="full-width"
        filled
        dark
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      >
        <template v-slot:append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>
      <q-btn type="submit" size="large" color="primary" class="full-width">SIGN IN</q-btn>
    </q-form>
    <q-toggle
      v-model="settings.isLowPerf"
      color="green"
    />
  </FssFallback>
</template>

<script lang="ts" setup>

import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';

import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';
// import FssFallback from 'src/components/FlatSurfaceShader.vue';
import { useLoginShaders } from 'src/utils/shaders';
import FssFallback from 'src/components/FssFallback.vue';
  import { useSettingsStore } from 'src/stores/settings';

const login = ref('');
const password = ref('');
const showPassword = ref(false);
const loginShaders = useLoginShaders();
const router = useRouter();
const onSubmitForm = (form: Event) => {
  console.log('Submitting form', form, login, password);
  router.push('/');
};
  const settings = useSettingsStore();

</script>
