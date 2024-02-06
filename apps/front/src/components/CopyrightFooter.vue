<template>
  <q-page-sticky class="mini-footer bg-transparent">
    <span class="text-primary">
      Made with <q-icon name="favorite" color="red"/> by
      <BgSocial
        login="adda-sil"
        name="Adrien Fernandes"
        linkedin="adrienfernandes"
        website="http://fernandes.bzh"
        image="https://cdn.intra.42.fr/users/bbe3a4ac809728a21b15436c6d7aa474/adda-sil.jpg"
        github="untel" />
      <BgSocial
        image="https://cdn.intra.42.fr/users/ad7c03cb383dfeadf5fad9657ac241ad/lspiess.jpg"
        login="lspiess" name="Lambert Spiess" github="lambertspiess"
        linkedin="lambert-spiess-34493b173"
      />
      <BgSocial
        image="https://cdn.intra.42.fr/users/bd729e0cbee8e29db82040e32aa4c052/edal--ce.jpg"
        login="edal--ce" name="Enzo Dal Cerro" github="endcerro" linkedin="enzodalcerro"/>
      <BgSocial
        image="https://cdn.intra.42.fr/users/bd0526feb9f6bc508a2219f6bdbf8dc7/gozsertt.jpg"
      login="gozsertt" name="Guillaume Ozserttas" />

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
