import _ from "lodash";

class Emitter {
  constructor() {
    this.events = {};
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((fn) => fn(...args));
    }
    return this;
  }

  on(event, fn) {
    console.log("this.events[event]", event);
    if (this.events[event]) this.events[event].push(fn);
    else this.events[event] = [fn];
    console.log("this", this);
    return this;
  }

  off(event, fn) {
    if (event && _.isFunction(fn)) {
      const listeners = this.events[event];
      const index = listeners.findIndex((_fn) => _fn === fn);
      listeners.splice(index, 1);
    } else this.events[event] = [];
    return this;
  }
}

export default Emitter;
