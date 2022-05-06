<template setup>
  <!-- <flat-surface-shader
    type="svg"
    style="height: 100vh; display: flex; justify-content: center; align-items: center;"
    :light="{
      ambient: '#2c3893', diffuse: '#407a3c',
      draw: false, zOffset: 60, maxDistance: 200, autopilot: false
    }"
    :mesh="{ diffuse: '#ffffff', ambient: '#000b64', depth: 10,
      segments: 14, slices: 9, width: 1.2, height: 1.2
    }"> -->
  <flat-surface-shader
    type="svg"
    style="height: 100vh; display: flex; justify-content: center; align-items: center;"
    :mesh="{
      diffuse: '#1a41a0', ambient: '#040225', depth: 25,
      segments: 16, slices: 8, width: 1.2, height: 1.2
    }"
    :light="{
      ambient: '#00a07a', diffuse: '#8baf19', count: 3,
      draw: true, zOffset: 100, autopilot: false
    }"
  >
  <!-- <flat-surface-shader
    type="canvas"
    style="height: 100vh; display: flex; justify-content: center; align-items: center;"
    :mesh="{ ambiant: '#343d82', diffuse: '#425021', depth: 13,
      segments: 14, slices: 9, width: 1.2, height: 1.2
    }"
    :light="{
      ambient: '#0b3737', diffuse: '#5b691b', count: 3,
      draw: false, zOffset: 33, autopilot: false
    }"> -->
    <q-form
      ref="form"
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
      <q-btn type="submit" size="large" color="primary" class="full-width">SIGN IN</q-btn>
      <!-- <pre style="background-color: red">yo -> {{ form }}</pre> -->
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
import { useRouter, useRoute } from 'vue-router';

const onSubmitForm = (form) => {
  console.log('Submitting form', form);
  useRouter().push('/');
};

export default defineComponent({
  name: 'LoginPage',
  components: { FlatSurfaceShader },
  setup() {
    return { onSubmitForm };
  },
});
</script>
