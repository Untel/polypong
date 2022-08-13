import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { Dark } from 'quasar';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    isLowPerf: useStorage('isLowPerf', true),
    theme: useStorage<'dark' | 'light' | 'auto'>('theme', 'auto'),
  }),
  getters: {
    getIsLowPerf: (state) => state.isLowPerf,
  },
  actions: {
    toggleLowPerf() {
      this.isLowPerf = !this.isLowPerf;
    },
  },
});
