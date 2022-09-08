<style lang="scss" scoped>
  .login-form {
    display: flex;
    flex-direction: column;
    place-items: center;
    width: min(400px, 80%);
  }
</style>

<template>
<q-form
  ref="form"
  center
  class="q-gutter-md login-form"
  @submit="connectWithLocal"
  aria-autocomplete="off"
>
  <q-input
    dark
    v-model="login"
    class="full-width"
    filled
    label="Email"
    lazy-rules
    :rules="[ val => val && val.length > 0 || 'Please type something']"
  />
  <q-input
    dark
    v-model="password"
    class="full-width"
    filled
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
  <q-separator size="2px" class="full-width" />
  <!-- <h6>{{ `/api/auth/intra?redirect=${route.query.redirect}` }}</h6> -->
  <q-btn :href="`/api/auth/intra`" size="large" color="secondary" class="full-width">
    Connect with &nbsp;<q-icon name="img:src/assets/42_logo.svg"/>
  </q-btn>
</q-form>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify } from 'quasar';
import { mande, defaults, MandeError } from 'src/libs/mande';

const auth = useAuthStore();

const login = ref<string>('');
const password = ref<string>('');
const showPassword = ref<boolean>(false);
const router = useRouter();
const route = useRoute();

const connectWithLocal = async (form: Event) => {
  const redirect = route.query.redirect
    ? JSON.parse((route.query.redirect as string))
    : { name: 'home' };
  await auth.login(login.value, password.value);
  router.push(redirect);
};

</script>
