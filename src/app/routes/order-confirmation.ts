import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'order-confirmation-page',
  template: `
    <div class="order-confirm-page">
      <div class="order-confirm-icon">✅</div>
      <h2 class="order-confirm-title">Pedido Recebido!</h2>
      <div class="order-confirm-msg">
        Obrigado pela sua compra.<br>
        Em breve receberá um email com os detalhes do pedido.
      </div>
      <button type="button" class="order-confirm-btn" (click)="goHome()">Voltar à loja</button>
    </div>
  `,
  styles: [`
    .order-confirm-page {
      max-width: 420px;
      margin: 3.5rem auto;
      padding: 2.5rem 2rem;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--elev-2);
      text-align: center;
    }
    .order-confirm-icon {
      font-size: 3.5rem;
      margin-bottom: 1.2rem;
      color: var(--color-success, #1f8f4d);
    }
    .order-confirm-title {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 1.2rem;
      color: var(--color-primary);
    }
    .order-confirm-msg {
      font-size: 1.15rem;
      color: var(--color-text-muted);
      margin-bottom: 2.2rem;
    }
    .order-confirm-btn {
      background: var(--color-primary-gradient, linear-gradient(90deg, #0d5fa6 60%, #1286c7 100%));
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: var(--elev-2);
      transition: background .2s;
    }
    .order-confirm-btn:hover, .order-confirm-btn:focus {
      background: var(--color-primary-accent, #2563eb);
    }
  `]
})
export class OrderConfirmationPageComponent {
  private readonly router = inject(Router);
  goHome() {
    this.router.navigate(['']);
  }
}
