import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    isLowPerf: useStorage('isLowPerf', true),
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
