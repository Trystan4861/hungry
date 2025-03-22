import { defineNuxtPlugin } from '#app'
import touchDirective from '~/directives/touch'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('touch', touchDirective)
})
