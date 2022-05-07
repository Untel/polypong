import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    isLowPerf: false,
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
