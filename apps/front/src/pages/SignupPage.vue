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
  @submit="onSignUp"
  autocorrect="off"
  autocapitalize="off"
  autocomplete="off"
  spellcheck="false"
  autofocus
>
  <q-input
    v-model="email"
    dense
    class="full-width"
    filled
    label="Email"
    lazy-rules
    :rules="[
      val => !!val || 'Missing email',
      isValidEmail
    ]"
  />
  <q-input
    v-model="name"
    dense
    class="full-width"
    filled
    label="Username"
    aria-autocomplete="username"
    autocomplete="username"
    lazy-rules
    :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
  />
  <PasswordInput
    v-model="password"
    class="full-width"
    dense
    aria-autocomplete="new-password"
    autocomplete="new-password"
    filled
    label="password"
  />
  <PasswordInput
    v-model="repeatPassword"
    class="full-width"
    dense
    filled
    label="Repeat password"
    aria-autocomplete="new-password"
    autocomplete="new-password"
    :rules="[ (val: string) => val === password || 'The password dont match']"
  />

  <CoalitionSelector
    v-model="coalition"
    label="Coalition"
    lazy-rules
    :rules="[(val: CoalitionChoice) => !!val && val.length || 'You must choose a coalition']"
  />

  <q-btn type="submit" size="large" color="primary" class="full-width">SIGN UP</q-btn>
</q-form>
</template>

<script lang="ts" setup>
import {
  ref, watch, onBeforeUnmount,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify } from 'quasar';

import CoalitionSelector from 'src/components/CoalitionSelector.vue';
import { useAuthStore } from 'src/stores/auth.store';
import LogoCoalition from 'src/components/LogoCoalition.vue';
import PasswordInput from 'src/components/PasswordInput.vue';
import { CoalitionChoice } from 'src/types';

const email = ref<string>('');
const name = ref<string>('');
const password = ref<string>('');
const repeatPassword = ref<string>('');
const coalition = ref<CoalitionChoice>(CoalitionChoice.ALLIANCE);
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const onSignUp = async (form: Event): Promise<void> => {
  try {
    await auth.register(
      name.value,
      email.value,
      password.value,
      coalition.value,
    );
    const redirect = route.query.redirect
      ? JSON.parse((route.query.redirect) as string)
      : { name: 'home' };
    router.push(redirect);
  } catch ({ response, body }) {
    console.log('Failed sign up');
  }
};

const isValidEmail = (val: string): any => {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || 'Seems to be an incorrect email';
};

const emit = defineEmits(['changeBackground']);

watch(coalition, (coa) => {
  emit('changeBackground', coa);
});

onBeforeUnmount(() => {
  emit('changeBackground', null);
});
</script>
