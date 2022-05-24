import { createFetch } from '@vueuse/core'

export const useApi = createFetch({
  baseUrl: 'http://localhost:3000/api',
  options: {
    async beforeFetch({ options }) {
      //
      // const myToken = await getMyToken()
      // options.headers.Authorization = `Bearer ${myToken}`
      console.log('Running fetch api', options);
      return { options }
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})