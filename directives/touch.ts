import type { DirectiveBinding } from 'vue'

export default {
  getSSRProps() {
    // Return empty object for SSR
    return {}
  },
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const event = binding.arg
    const handler = binding.value
    const once = binding.modifiers.once

    if (!event || !handler) return

    const eventMap: Record<string, string> = {
      tap: 'click',
      press: 'touchstart',
      release: 'touchend',
      drag: 'touchmove'
    }

    const browserEvent = eventMap[event]
    if (!browserEvent) return

    const listener = (e: Event) => {
      handler(e)
      if (once) {
        el.removeEventListener(browserEvent, listener)
      }
    }

    el.addEventListener(browserEvent, listener)
  }
}
