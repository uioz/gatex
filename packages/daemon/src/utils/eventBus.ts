export function on(type: string, listener: () => void) {
  window.addEventListener(type, listener);
}

export function off(type: string, listener: () => void) {
  window.removeEventListener(type, listener);
}

export function emit(type: string) {
  window.dispatchEvent(new Event(type));
}
