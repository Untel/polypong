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
    v-model="login"
    class="full-width"
    filled
    label="Login"
    hint="Username or email"
    lazy-rules
    :rules="[ val => val && val.length > 0 || 'Please type something']"
  />
  <q-input
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
  <q-btn @click="connectWith42" size="large" color="secondary" class="full-width">
    Connect with &nbsp;<q-icon name="img:src/assets/42_logo.svg"/>
  </q-btn>
</q-form>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify } from 'quasar';
import { mande, defaults, MandeError } from 'mande';

const auth = useAuthStore();

const login         = ref('');
const isLogging    = ref(false);
const password      = ref('');
const showPassword  = ref(false);
const router        = useRouter();
const route         = useRoute();

const connectWithLocal = async (form: Event) => {
  try {
    await auth.login(login.value, password.value);
    const redirect = route.query.redirect
      ? JSON.parse(route.query.redirect)
      : { name: 'home' }
    router.push(redirect);
  } catch (error: MandeError) {
    Notify.create({
      type: 'negative',
      message: error.message || error.error,
    });
  }
};

const connectWith42 = (form: Event) => {
};
</script>
