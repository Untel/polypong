import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-polypong-ui'

export default boot(({ app }) => {
  app.use(VuePlugin)
})
