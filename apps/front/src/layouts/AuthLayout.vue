<style lang="scss" scoped>
  .login-background {
    min-height: 100vh !important;
    max-height: 100vh !important;
    height: 100vh !important;
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
      v-bind="backgroundParams"
    >
      <div class="form-container">
        <FourtyTwoLogo size="100px" style="justify-self: center;" />
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
        <router-view @changeBackground="changeBackground"/>
      </div>
    </FssFallback>
  </q-page>
</template>

<script lang="ts" setup>
import FssFallback from 'src/components/FssFallback.vue';
import { useLoginShaders, defaultLoginLight } from 'src/utils/shaders';
import { CoalitionChoice, coalitionsShadersMap, coalitions } from 'src/types';
import FourtyTwoLogo from 'src/components/FourtyTwoLogo.vue';
import { ref } from 'vue';

const defaultBackgroundParams = {
  fssSettings: useLoginShaders(),
  fallbackUrl: '/background_login.jpg',
};
const backgroundParams = ref(defaultBackgroundParams);

const changeBackground = (coalition: CoalitionChoice) => {
  if (!coalition) { backgroundParams.value = null; } else {
    backgroundParams.value = {
      fssSettings: coalitions[coalition].shaderConfig,
      fallbackUrl: coalitions[coalition].fssFallback,
    };
  }
};
</script>
