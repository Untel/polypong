<style lang="scss" scoped>
  .login-form {
    display: flex;
    flex-direction: column;
    place-items: center;
    width: min(400px);
  }
</style>

<template>
<q-form
  ref="form"
  center
  class="q-gutter-md login-form"
  @submit="onSubmitForm"
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
</q-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const login = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();
const onSubmitForm = (form: Event) => {
  console.log('Submitting form', form, login, password);
  router.push('/');
};
</script>
