type EventCallback = (data: any) => void;

export const EventEmitter = {
  _events: {} as Record<string, EventCallback[]>,

  dispatch: function (event: string, data?: any) {
    if (!this._events[event]) return;
    this._events[event].forEach((callback) => callback(data));
  },

  subscribe: function (event: string, callback: EventCallback) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
    return () => {
      this._events[event] = this._events[event].filter((cb) => cb !== callback);
    };
  },

  get: function (event: string) {
    return this._events[event];
  },
};