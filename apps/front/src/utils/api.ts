import { createFetch } from '@vueuse/core'
import { LoadingBar } from 'quasar';
export const useApi = createFetch({
  baseUrl: 'http://localhost:3000/api',
  options: {
    async beforeFetch({ options }) {
      //
      // const myToken = await getMyToken()
      // options.headers.Authorization = `Bearer ${myToken}`
      console.log('Running fetch api', options);
      LoadingBar.start();
      return { options }
    },
    async afterFetch(ctx) {
      LoadingBar.stop();
      return ctx;
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})