export function getCssVar(name: string) {
    const root = document.documentElement
    const style = getComputedStyle(root)
    return style.getPropertyValue(`--${name}`).trim()
  }
export function toPixels(value: string): number {
    if (value.endsWith('px')) return parseFloat(value)
    if (value.endsWith('rem')) {
      const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      return parseFloat(value) * remSize
    }
    return 0 // fallback
  }
