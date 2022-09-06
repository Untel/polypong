import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import 'src/libs/fss';
import { defaults } from 'src/libs/mande';

export default boot(({ app }) => {
  const i18n = createI18n({
    locale: 'en-US',
    messages,
  });
  app.use(i18n);
  defaults.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
});
