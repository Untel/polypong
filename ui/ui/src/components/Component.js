import { h } from 'vue'
import { QBadge } from 'quasar'

export default {
  name: 'Polypong',

  setup () {
    return () => h(QBadge, {
      class: 'Polypong',
      label: 'Polypong'
    })
  }
}
