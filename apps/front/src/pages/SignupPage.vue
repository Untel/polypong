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
  autocorrect="off"
  autocapitalize="off"
  autocomplete="off"
  spellcheck="false"
  autofocus
>
  <q-input
    v-model="email"
    class="full-width"
    filled
    label="Email"
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
  <LogoCoalition />
  <LogoBannerCoalition :show-banner="showPassword" />
  <q-input
    v-model="repeatPassword"
    class="full-width"
    filled
    label="Repeat password"
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
  
  <q-btn type="submit" size="large" color="primary" class="full-width">SIGN UP</q-btn>
</q-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LogoCoalition from 'src/components/LogoCoalition.vue';
import LogoBannerCoalition from 'src/components/LogoBannerCoalition.vue';
const email           = ref(''),
      password        = ref(''),
      repeatPassword  = ref('')
;
const showPassword = ref(false);
const router = useRouter();
const onSubmitForm = (form: Event) => {
  router.push('/');
};
</script>
