import { mande, defaults } from 'mande';
import { boot } from 'quasar/wrappers';
import 'src/libs/fss';
import * as moment from 'moment';

export default boot(({ app }) => {
  // eslint:disable-next-line
  console.log(app, 'moment?', moment);
  app.config.globalProperties.$moment = moment;

  // const originalFetch = fetch;
  // window.fetch = function (url, init?) {
  //   url = url.toString().replace('g.tenor.com/v1', 'tenor.googleapis.com/v2');
  //   return originalFetch(url, init);
  // };
});
