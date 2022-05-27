import { createFetch } from '@vueuse/core'
import { parse } from 'path';
import { LoadingBar, Notify } from 'quasar';
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
    async onFetchError(ctx) {
      LoadingBar.stop();
      const err = JSON.parse(ctx.data);
      const messages = err?.message || [];
      messages.length && Notify.create({
        type: 'negative',
        message: 'Oooops, something went wrong',
        caption: messages
          .reduce((prev: String, next: String) => `${prev}\n${next}`, ''),
      });
      return ctx;
    }
  },
  fetchOptions: {
    mode: 'cors',
  },
})