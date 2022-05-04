import Component from './components/Component'
import Directive from './directives/Directive'

const version = __UI_VERSION__

function install (app) {
  app.component(Component.name, Component)
  app.directive(Directive.name, Directive)
}

export {
  version,
  Component,
  Directive,
  install
}
