import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  standalone: true,
  selector: 'toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="toast-wrapper" aria-live="polite" aria-atomic="true">
      @for (t of toast.toasts().slice(0,3); track t.id) {
        <div class="toast" [class.success]="t.type === 'success'" [class.error]="t.type === 'error'" [class.info]="t.type === 'info'" (click)="dismiss(t.id)" role="status">
          <span class="text">{{ t.text }}</span>
          <button type="button" class="close" aria-label="Fechar" (click)="dismiss(t.id); $event.stopPropagation()">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
  .toast-wrapper { position: fixed; bottom: 6.2rem; right: 1.25rem; display:flex; flex-direction:column; gap:.55rem; z-index: 4000; max-width: 280px; }
    .toast { position:relative; background: var(--color-surface); color: var(--color-text); border:1px solid var(--color-border); padding:.65rem .9rem .65rem .8rem; border-radius: var(--radius-lg); box-shadow: var(--elev-3,0 6px 22px rgba(0,0,0,.2)); font-size:.7rem; line-height:1.25; font-weight:600; letter-spacing:.35px; animation: toastIn .35s cubic-bezier(.4,0,.2,1); cursor:pointer; pointer-events:auto; display:flex; align-items:center; gap:.65rem; }
    .toast.success { border-color: var(--color-success-border,#0c6); background: linear-gradient(135deg, var(--color-success-bg,#e6fff6), var(--color-success-bg2,#f4fff9)); }
    .toast.error { border-color: var(--color-danger,#c00); background: linear-gradient(135deg,#ffecec,#fff6f6); }
    .toast.info { border-color: var(--color-primary,#06c); background: linear-gradient(135deg,#eef5ff,#f5f9ff); }
    .toast .close { position:absolute; top:2px; right:4px; background:none; border:none; font-size:.9rem; line-height:1; color: var(--color-text-muted); cursor:pointer; padding:.25rem; }
    .toast .close:hover, .toast .close:focus { color: var(--color-text); }
    @media (max-width:640px) { .toast-wrapper { right:50%; transform:translateX(50%); left:auto; bottom:5.8rem; width: min(90vw,340px); } }
    @keyframes toastIn { from { transform: translateY(8px) scale(.96); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }
  `]
})
export class ToastContainerComponent {
  toast = inject(ToastService);
  dismiss(id: number) { this.toast.dismiss(id); }
}
