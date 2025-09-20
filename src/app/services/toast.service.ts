import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type?: 'info' | 'success' | 'error';
  timeout?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  toasts = this._toasts.asReadonly();
  private _id = 0;

  show(text: string, opts: { type?: 'info' | 'success' | 'error'; timeout?: number } = {}) {
    const msg: ToastMessage = { id: ++this._id, text, type: opts.type ?? 'success', timeout: opts.timeout ?? 2800 };
    this._toasts.update(list => [...list, msg]);
    if (msg.timeout && msg.timeout > 0) {
      setTimeout(() => this.dismiss(msg.id), msg.timeout);
    }
  }

  dismiss(id: number) {
    this._toasts.update(list => list.filter(m => m.id !== id));
  }

  clear() { this._toasts.set([]); }
}
