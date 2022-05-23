import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
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
