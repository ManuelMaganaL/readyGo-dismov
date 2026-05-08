// Logger que solo imprime en desarrollo.
// En producción (__DEV__ === false), todas las llamadas son no-op.
const noop = (..._args: any[]) => {};

export const logger = {
  log: __DEV__ ? console.log.bind(console) : noop,
  error: __DEV__ ? console.error.bind(console) : noop,
  warn: __DEV__ ? console.warn.bind(console) : noop,
};
