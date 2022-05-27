<style lang="scss" scoped>
  .login-background {
    min-height: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form-container {
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
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
        <Logo size="100px" style="justify-self: center;" />
        <q-tabs>
          <q-route-tab
            to="/auth"
            exact
            label="Login"
          />
          <q-route-tab
            to="/auth/signup"
            exact
            label="Sign up"
          />
        </q-tabs>
        <router-view />
      </div>
    </FssFallback>
  </q-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useLoginShaders, useLoginLightShaders } from 'src/utils/shaders';
import FssFallback from 'src/components/FssFallback.vue';
import Logo from 'src/components/Logo.vue';
</script>
