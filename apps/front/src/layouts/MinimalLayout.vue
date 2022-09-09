<style lang="scss" scoped>
  .mini-footer {
    left: initial;
  }
</style>

<template>
  <q-layout full-height view="lhH Lpr lfF">
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-page-sticky reveal
      v-if="!disabled"
      class="mini-footer bg-transparent"
      >
      <span class="text-primary">
        Made with <q-icon name="favorite" color="red"/> by
        <BgSocial
          name="Adrien Fernandes"
          login="adda-sil"
          linkedin="adrienfernandes"
          website="http://fernandes.bzh"
          github="untel"
        />
        <BgSocial
          name="Lambert Spiess"
          login="lspiess"
          github="lambertspiess"
          linkedin="lambert-spiess-34493b173"
        />
        <BgSocial
          name="Enzo Dal Cerro"
          login="edal--ce"
          github="endcerro"
          linkedin="enzo-dal-cerro"
        />
        <BgSocial
          name="Guillaume Ozserttas"
          github="GuillaumeOz"
          linkedin="guillaume-ozserttas"
          login="gozsertt"
        />

      </span>
      <q-toggle
        checked-icon="mdi-speedometer"
        unchecked-icon="mdi-speedometer-slow"
        color="green"
        :true-value="false"
        :false-value="true"
        v-model="settings.isLowPerf"
      />
      <q-toggle
        checked-icon="light_mode"
        unchecked-icon="dark_mode"
        indeterminate-icon="settings_brightness"
        color="yellow"
        indeterminate-value="auto"
        toggle-indeterminate
        :true-value="'light'"
        :false-value="'dark'"
        icon-color="orange"
        v-model="settings.theme"
      />
    </q-page-sticky>
  </q-layout>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'src/stores/settings';
import BgSocial from 'src/components/BgSocial.vue';
import { Dialog, Notify, useQuasar } from 'quasar';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const $q = useQuasar();
const $route = useRoute();
const settings = useSettingsStore();

const disabled = computed(() => {
  const dis = $route.path.includes('inbox') && $q.screen.lt.md;
  return dis;
});

const askPermission = (DeviceOrientationEvent as any).requestPermission;
async function tryPermission() {
  try {
    if (await askPermission() !== 'granted') throw new Error('No perm granted');
  } catch (error: Error) {
    const dismiss = Dialog.create({
      message: `Require gyroscope permissions: ${error.message}`,
    }).onDismiss(async () => {
      if (await askPermission() !== 'granted') {
        Notify.create({
          type: 'negative',
          message: 'Fail to ask permissions, please reload your browser.',
        });
      }
    });
  }
}

onMounted(async () => {
  if ($q.platform.is.mobile) {
    tryPermission();
  }
});
</script>
