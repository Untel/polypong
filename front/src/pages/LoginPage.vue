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

<template setup>
  <flat-surface-shader
    class="login-background"
    v-bind="loginShaders"
  >
    <q-form
      ref="form"
      dark center
      class="q-gutter-md login-form"
      @submit="onSubmitForm"
    >
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
        type="password"
        label="Password"
        lazy-rules
      />
      <q-btn type="submit" size="large" color="primary" class="full-width">SIGN IN</q-btn>
    </q-form>
  </flat-surface-shader>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';

import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';
import { useLoginShaders } from 'src/utils/shaders';

export default defineComponent({
  name: 'LoginPage',
  components: { FlatSurfaceShader },
  setup() {
    const login = ref(''), password = ref('');
    const router = useRouter();
    const onSubmitForm = (form: Event) => {
      console.log('Submitting form', form, login, password);
      router.push('/');
    };
    return {
      onSubmitForm,
      login,
      password,
      loginShaders: useLoginShaders()
    };
  },
});
</script>
