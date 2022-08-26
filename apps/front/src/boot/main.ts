import { mande, defaults } from 'mande';
import { boot } from 'quasar/wrappers';
import 'src/libs/fss';
import * as moment from 'moment';

export default boot(({ app }) => {
  // eslint:disable-next-line
  app.config.globalProperties.$env = process.env;

  const originalFetch = fetch;
  window.fetch = function (url, init?) {
    // url = url.toString().replace('g.tenor.com/v1', 'tenor.googleapis.com/v2');
    if (!url.toString().includes('g.tenor.com/v1')) {
      return originalFetch(url, init);
    }
    return Promise.resolve()
      .then(() => {
        const resp = new Response('[]');
        return resp;
      });
  };
});
