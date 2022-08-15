<template>
  <q-layout full-height view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-page-sticky class="absolute bg-transparent">
      <span class="text-primary">
        Made with <q-icon name="favorite" color="red"/> by
        <BgSocial login="adda-sil"
          name="Adrien Fernandes"
          linkedin="adrienfernandes"
          website="http://fernandes.bzh"
          github="untel" />
        <BgSocial
          login="lspiess" name="Lambert Spiess" github="lambertspiess"
          linkedin="lambert-spiess-34493b173"
        />
        <BgSocial login="edal--ce" name="Enzo Dal Cerro" github="endcerro" linkedin="enzodalcerro"/>
        <BgSocial login="gozsertt" name="Guillaume Ozserttas" />

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
import { Notify, useQuasar } from 'quasar';
import { onMounted } from 'vue';

const $q = useQuasar();
const settings = useSettingsStore();
const askPermission = (DeviceOrientationEvent as any).requestPermission;

onMounted(async () => {
  if ($q.platform.is.mobile) {
    try {
      if (await askPermission() !== 'granted') throw new Error();
    } catch (error: Error) {
      Notify.create({
        message: 'You need browser permissions',
        actions: [{
          label: 'Ask',
          color: 'danger',
          handler: () => askPermission(),
        }],
      });
    }
  }
});
</script>
