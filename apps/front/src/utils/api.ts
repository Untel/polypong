import { createFetch } from '@vueuse/core';
import { LoadingBar, Notify } from 'quasar';
import { useRouter } from 'vue-router';

export const useApi = createFetch({
  baseUrl: 'http://localhost:8080/api',
  options: {
    async beforeFetch({ options }) {
      //
      // const myToken = await getMyToken()
      // options.headers.Authorization = `Bearer ${myToken}`
      console.log('Running fetch api', options);
      LoadingBar.start();
      return { options };
    },
    async afterFetch(ctx) {
      LoadingBar.stop();
      return ctx;
    },
    async onFetchError(ctx) {
      LoadingBar.stop();
      const { data, response, error } = ctx;

      if (response?.status === 401) {
        console.log('Redirecting because unauth');
        const router = useRouter();
        router.replace({ name: 'login' });
        return ctx;
      }

      if (response?.status >= 400) {
        const err = JSON.parse(ctx.data);
        const messages = err?.message || [];
        if (messages.length) {
          console.log('Messages', messages);
          Notify.create({
            type: 'negative',
            message: 'Oooops, something went wrong',
            caption: messages
              .reduce((prev: string, next: string) => `${prev}\n${next}`, ''),
          });
        }
      }
      return ctx;
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
});

// process.env.API_URL = 'http://localhost:3000';
// export const api = mande(`${process.env.API_URL}/api`);
