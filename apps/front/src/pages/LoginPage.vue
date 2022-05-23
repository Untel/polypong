<style lang="scss" scoped>
  .login-background {
    min-height: inherit;
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

  .form-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items:center;
  }
</style>

<template>
  <q-page>
    <FssFallback
      class="login-background"
      :fss-settings="$q.dark.isActive ? useLoginShaders() : useLoginLightShaders()"
      fallback-url="/src/assets/background_login.jpg"
    >
      <div class="form-container">
        <q-form
          ref="form"
          center
          class="q-gutter-md login-form"
          @submit="onSubmitForm"
          aria-autocomplete="off"
        >
          <!-- <pre>Low perf: {{ settings.getIsLowPerf }}</pre> -->
          <Logo size="100px" style="justify-self: center;" />
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
      </div>
    </FssFallback>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';
import { useLoginShaders, useLoginLightShaders } from 'src/utils/shaders';
import FssFallback from 'src/components/FssFallback.vue';
import Logo from 'src/components/Logo.vue';

const login = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();
const onSubmitForm = (form: Event) => {
  console.log('Submitting form', form, login, password);
  router.push('/');
};
</script>
