// Módulo independiente para disparar el sync desde sqlite.ts
// sin crear dependencia circular (sqlite.ts -> sync.ts -> sqlite.ts).
// sync.ts registra su callback aquí; sqlite.ts lo invoca.

let _triggerFn: (() => void) | null = null;

export const registerSyncTrigger = (fn: () => void) => {
  _triggerFn = fn;
};

export const fireSyncTrigger = () => {
  if (_triggerFn) _triggerFn();
};
