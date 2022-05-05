<template>
  <flat-surface-shader
    type="canvas"
    style="height: 100vh; display: flex; justify-content: center; align-items: center;"
    :light="{ambient: '#2d374c', diffuse: '#00babb', draw: true}"
    :mesh="{ diffuse: '#2d374c',
      segments: 20, slices: 20, width: 1.8, height: 1.8
    }">
    <q-form
      dark
      @submit="onSubmitForm"
      class="q-gutter-md login-form"
      center
      style="width: 400px"
    >
      <img style="width:100px; justify-self: center;" src="src/assets/42_logo.svg"/>
      <q-input
        class="full-width"
        filled
        dark
        label="Login"
        hint="Username or email"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
      class="full-width"
        filled
        dark
        type="password"
        label="Password"
        lazy-rules
      />
      <q-btn color="primary" class="full-width">SIGN IN</q-btn>
    </q-form>
  </flat-surface-shader>
</template>

<style lang="scss">
  .login-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import FlatSurfaceShader from 'src/components/FlatSurfaceShader.vue';

const onSubmitForm = (form) => {
  console.log('Submitting form');
};

export default defineComponent({
  name: 'LoginPage',
  components: { FlatSurfaceShader },
  setup() {
    return { onSubmitForm };
  },
});
</script>
