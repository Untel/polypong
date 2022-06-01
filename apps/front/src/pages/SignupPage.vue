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
  @submit="onSubmitForm"
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
    lazy-rules
    :rules="[ val => val && val.length > 2 || 'Username should have at least 2 chars']"
  />
  <q-input
    v-model="password"
    class="full-width"
    filled
    dense
    label="Password"
    :type="showPassword ? 'text' : 'password'"
    lazy-rules
    :rules="[
      val => !!val || 'Password cannot be empty',
      val => val.length > 6 || 'Password must be stronger',
    ]"
  >
    <template v-slot:append>
      <q-icon
        :name="showPassword ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>
  </q-input>
  <q-input
    v-model="repeatPassword"
    class="full-width"
    dense
    filled
    label="Repeat password"
    :type="showPassword ? 'text' : 'password'"
    lazy-rules
    :rules="[ val => val === password || 'The password dont match']"
  >
    <template v-slot:append>
      <q-icon
        :name="showPassword ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>
  </q-input>

  <CoalitionSelector
    label="Coalition"
    v-model="coalition"
    lazy-rules
    :rules="[val => !!val && val.length || 'You must choose a coalition']"
  />

  <q-btn type="submit" size="large" color="primary" class="full-width">SIGN UP</q-btn>
</q-form>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import LogoCoalition from 'src/components/LogoCoalition.vue';
import CoalitionSelector from 'src/components/CoalitionSelector.vue';
import { useAuthStore } from 'src/stores/auth.store';
import { ValidationRule } from 'quasar';

const email           = ref<String>(''),
      name            = ref<String>(''),
      password        = ref<String>(''),
      repeatPassword  = ref<String>(''),
      coalition       = ref<String>(''),

      showPassword    = ref(false),
      router          = useRouter(),
      auth            = useAuthStore();

const onSubmitForm = async (form: Event) => {
  const res = await auth.register(
    name.value,
    email.value,
    password.value,
    coalition.value,
  );
};

const isValidEmail = (val: string): any => {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || 'Seems to be an incorrect email';
}

const emit = defineEmits(['changeBackground']);

watch(coalition, (coa) => {
  emit('changeBackground', coa);
});

onBeforeUnmount(() => {
  emit('changeBackground', null);
});
</script>
