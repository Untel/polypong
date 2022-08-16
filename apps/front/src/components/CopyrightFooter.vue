<template>
  <q-page-sticky class="mini-footer bg-transparent">
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
      v-model="$settings.isLowPerf"
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
      v-model="$settings.theme"
    />
  </q-page-sticky>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'src/stores/settings';

const $settings = useSettingsStore();
</script>
