import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
// Only one import statement for Angular core
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'cart-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // imports removed
  template: `
    @if (!open) {
    <button class="cart-fab" type="button" (click)="open = !open" [attr.aria-expanded]="open">
      🛒 @if (cart.totalQuantity() > 0) { <span class="qty">{{ cart.totalQuantity() }}</span> }
    </button>
    } @if (open) {
    <div class="cart-backdrop" (click)="closeIfBackdrop($event)">
      <div
        class="cart-panel"
        role="dialog"
        aria-label="Carrinho"
        (click)="onPanelClick($event)"
        [class.has-one-item]="coreItemCount() === 1"
        [class.has-items]="coreItemCount() > 0"
      >
        <div class="cart-panel-header">
          <h3>Carrinho</h3>
          @if (cart.items().length > 0) { @if (confirmClear) {
          <div
            class="cart-header-meta confirm"
            role="alertdialog"
            aria-label="Confirmar limpeza do carrinho"
          >
            <div class="confirm-text">Quer mesmo remover todos os produtos do carrinho?</div>
            <div class="confirm-actions">
              <button type="button" class="btn-yes" (click)="doClearConfirm()">SIM</button>
              <button type="button" class="btn-no" (click)="cancelClearConfirm()">NÃO</button>
            </div>
          </div>
          } @else {
          <div class="cart-header-meta">
            <div class="total-inline">Total: {{ cart.totalPrice() }} €</div>
            <button
              type="button"
              class="clear-btn"
              (click)="startClearConfirm()"
              aria-label="Limpar carrinho"
            >
              Limpar
            </button>
          </div>
          }
          <!-- close confirmClear @if -->
          } @else {
          <div class="cart-header-meta"><div class="total-inline muted"></div></div>
          }
          <button type="button" class="close-btn" (click)="toggle(false)" aria-label="Fechar">
            ✕
          </button>
        </div>
        <div class="panel-body">
          @if (cart.items().length === 0) {
          <div class="empty">Vazio</div>
          } @else {
          <ul class="items">
            @for (item of displayItems(); track item.id; let i = $index) {
            <li>
              <span
                class="thumb"
                (click)="openMobileOverlay(item, $event)"
                [class.mobile-active]="mobilePreviewId === item.id"
              >
                <img [src]="item.imageUrl" alt="{{ item.name }}" />
                <span class="img-tooltip"
                  ><img [src]="item.imageUrl" alt="Pré-visualização" width="170" height="170"
                /></span>
              </span>
              <div class="info">
                <strong>{{
                  (item.name + (item.size ? ' ' + item.size : '')).toUpperCase()
                }}</strong>
                <span class="line"
                  ><span class="unit-line">{{ item.price }} € cada</span></span
                >
                <div class="qty-row" role="group" aria-label="Quantidade de {{ item.name }}">
                  <button
                    type="button"
                    class="qty-btn dec"
                    (click)="dec(item.id, item.qty, item.size)"
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span class="qty-val" aria-live="polite">{{ item.qty }}</span>
                  <button
                    type="button"
                    class="qty-btn inc"
                    (click)="inc(item.id, item.qty, item.size)"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                  <span class="line-total">= {{ item.qty * item.price }} €</span>
                </div>
              </div>
              <button type="button" (click)="remove(item.id, item.size)" aria-label="Remover">
                ✕
              </button>
            </li>
            }
          </ul>

          }
          <!-- close items @if/@else -->
        </div>
        <!-- close panel-body -->
        @if (cart.items().length > 0) {
        <div class="checkout-row">
          <button type="button" class="checkout-btn" (click)="finalizarCompra()">
            Finalizar compra
          </button>
        </div>
        } @if (cart.shipping()) {
        <div
          class="cart-footer-shipping"
          [class.free]="cart.shipping()!.price === 0"
          [class.due]="cart.shipping()!.price > 0"
        >
          <div class="ship-icon" aria-hidden="true">
            <img src="assets/images/icons/shipping.svg" alt="" />
          </div>
          <div class="ship-text">
            <div class="ship-line">
              <strong class="ship-label">{{
                cart.shipping()!.price === 0 ? 'PORTES GRÁTIS' : 'PORTES DE ENVIO'
              }}</strong>
              <span class="ship-amount" [class.free]="cart.shipping()!.price === 0">{{
                cart.shipping()!.price === 0 ? '0 €' : cart.shipping()!.price + ' €'
              }}</span>
            </div>
            @if (cart.shipping()!.price === 0) {
            <div class="ship-sub achieved">Atingiu o valor mínimo</div>
            } @else {
            <div class="ship-sub">
              @if (cart.subtotal() < 60) {
              <div class="remaining">
                Faltam <strong>{{ remainingToFree() }} €</strong> em produtos para portes grátis
              </div>
              <div class="subtotal-note big-note">
                Subtotal produtos: {{ cart.subtotal() }} € | Portes grátis ≥ 60 €
              </div>
              <div class="ship-progress footer" aria-hidden="true">
                <div class="bar" [style.width.%]="(cart.subtotal() / 60) * 100"></div>
              </div>
              }
            </div>
            }
          </div>
        </div>
        } @if (mobileOverlayUrl) {
        <div class="mobile-center-overlay" (click)="closeMobileOverlay($event)">
          <div class="mobile-center-spacer"></div>
          <div class="mobile-center-content" (click)="$event.stopPropagation()">
            <button
              type="button"
              class="overlay-close"
              (click)="closeMobileOverlay($event)"
              aria-label="Fechar pré-visualização"
            >
              ✕
            </button>
            <img [src]="mobileOverlayUrl" alt="Pré-visualização" />
          </div>
        </div>
        }
      </div>
      <!-- close cart-panel -->
    </div>
    <!-- close cart-backdrop -->
    }
  `,
  styles: [
    `
      .thumb {
        position: relative;
        display: inline-block;
      }
      .img-tooltip {
        position: absolute;
        top: -4px;
        left: 48px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 4px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
        display: none;
        z-index: 10;
        pointer-events: none;
      }
      .img-tooltip img {
        width: 170px;
        height: 170px;
        object-fit: cover;
        border-radius: 8px;
      }
      .thumb:hover .img-tooltip,
      .thumb:focus-within .img-tooltip {
        display: block;
      }
      @media (max-width: 640px) {
        .img-tooltip {
          display: none !important;
        }
      }
      .cart-fab {
        position: fixed;
        bottom: 3.5rem;
        right: 1.5rem;
        background: var(--color-primary);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 58px;
        height: 58px;
        cursor: pointer;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--elev-2);
        z-index: 1201;
      }
      @media (max-width: 760px) {
        .cart-fab {
          bottom: 4.5rem;
        }
      }
      .cart-fab.bump {
        animation: cartBump 0.5s cubic-bezier(0.34, 1.4, 0.64, 1);
      }
      .fixed-img-tooltip {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 12px;
        box-shadow: var(--elev-3, 0 6px 24px rgba(0, 0, 0, 0.18));
        z-index: 2000;
        pointer-events: none;
        animation: fadeIn 0.18s ease;
        max-width: 600px;
        max-height: 600px;
        width: auto;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fixed-img-tooltip img {
        max-width: 600px;
        max-height: 600px;
        width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: var(--radius-md);
      }
      .cart-fab .qty {
        background: #fff;
        color: var(--color-primary);
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 12px;
        margin-left: 0.35rem;
        font-weight: 700;
      }
      .cart-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        z-index: 1200;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }
      .cart-panel {
        position: relative;
        margin: 0 1rem 5.5rem 0;
        width: 360px;
        max-height: 62vh;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--elev-2);
        padding: 1.05rem 1.05rem 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        overflow-x: hidden;
      }
      .cart-panel.has-one-item .panel-body {
        min-height: 120px;
      }
      @media (max-width: 640px) {
        .cart-panel.has-one-item .panel-body {
          min-height: 120px;
        }
      }
      .panel-body {
        overflow: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-bottom: 3.5rem;
      }
      .cart-panel-header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 0.65rem;
        position: sticky;
        top: 0;
        background: var(--color-surface);
        z-index: 5;
        padding-bottom: 0.2rem;
      }
      .cart-header-meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .cart-header-meta.confirm {
        flex-direction: column;
        align-items: stretch;
        gap: 0.45rem;
        background: var(--color-primary-soft, rgba(0, 0, 0, 0.04));
        padding: 0.5rem 0.6rem 0.6rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--elev-1);
      }
      .confirm-text {
        font-size: 0.68rem;
        line-height: 1.25;
        font-weight: 600;
        letter-spacing: 0.3px;
        color: var(--color-primary);
      }
      .confirm-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      .btn-yes,
      .btn-no {
        border: none;
        cursor: pointer;
        font-size: 0.65rem;
        font-weight: 600;
        padding: 0.5rem 0.85rem;
        border-radius: var(--radius-sm);
        line-height: 1;
        letter-spacing: 0.5px;
      }
      .btn-yes {
        background: var(--color-danger);
        color: #fff;
        box-shadow: var(--elev-1);
      }
      .btn-yes:hover,
      .btn-yes:focus {
        background: var(--color-danger-hover, #b00020);
      }
      .btn-no {
        background: var(--color-surface);
        color: var(--color-text);
        border: 1px solid var(--color-border);
      }
      .btn-no:hover,
      .btn-no:focus {
        background: var(--color-primary-soft);
      }
      .total-inline {
        color: var(--color-primary);
        font-weight: 700;
        letter-spacing: 0.4px;
      }
      .total-inline.muted {
        color: var(--color-text-muted);
        font-weight: 500;
      }
      .clear-btn {
        background: var(--color-danger);
        color: #fff;
        border: none;
        padding: 0.55rem 0.85rem;
        min-height: 36px;
        border-radius: var(--radius-md);
        font-size: 0.7rem;
        cursor: pointer;
        line-height: 1;
        box-shadow: var(--elev-1);
        display: inline-flex;
        align-items: center;
      }
      .clear-btn:hover,
      .clear-btn:focus {
        background: var(--color-danger-hover, #b00020);
        outline: none;
      }
      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        line-height: 1;
        padding: 0.25rem;
        color: var(--color-text-muted);
      }
      .close-btn:hover,
      .close-btn:focus {
        color: var(--color-text);
      }
      .cart-panel h3 {
        margin: 0;
        font-size: 1.05rem;
      }
      .empty {
        text-align: center;
        color: var(--color-text-muted);
        padding: 0.75rem 0;
      }
      .items {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
        position: relative;
      }
      .items li {
        display: flex;
        gap: 0.6rem;
        align-items: center;
        position: relative;
        flex-wrap: wrap;
        padding: 0.45rem 0;
      }
      /* Full-width hairline separators spanning panel padding */
      .items li + li::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(
          to right,
          transparent 0%,
          var(--color-border) 8%,
          var(--color-border) 92%,
          transparent 100%
        );
        opacity: 0.9;
        pointer-events: none;
      }
      .items li:hover {
        background: rgba(var(--color-shadow-rgb), 0.05);
      }
      .items li:active {
        background: rgba(var(--color-shadow-rgb), 0.08);
      }
      .thumb {
        position: relative;
        display: inline-block;
      }
      .items img {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: var(--radius-sm);
        display: block;
      }
      .items li.shipping-row .thumb img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
        border-radius: 8px;
        background: var(--color-primary-soft);
        padding: 6px;
      }
      .items li.shipping-row strong {
        color: var(--color-text);
      }
      .shipping-price {
        font-weight: 600;
      }
      .shipping-price.free {
        color: var(--color-success, #059669);
        text-shadow: 0 0 2px rgba(255, 255, 255, 0.4);
      }
      .checkout-row {
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 -1.05rem -0.85rem;
        padding: 0.85rem 1.05rem 0.9rem;
        background: linear-gradient(to top, var(--color-surface) 78%, rgba(0, 0, 0, 0));
        backdrop-filter: blur(2px);
        display: flex;
        z-index: 15;
      }
      .checkout-btn {
        flex: 1;
        background: var(--color-primary);
        color: #fff;
        border: none;
        border-radius: var(--radius-lg);
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.6px;
        padding: 0.9rem 1rem;
        cursor: pointer;
        box-shadow: var(--elev-2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
      }
      .checkout-btn:hover,
      .checkout-btn:focus {
        background: var(--color-primary-accent, #2563eb);
        outline: none;
        box-shadow: var(--elev-3, 0 6px 18px rgba(0, 0, 0, 0.25));
      }
      .checkout-btn:active {
        transform: translateY(1px);
      }
      /* Unified shipping meta block */
      .shipping-meta {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        min-height: 54px;
        justify-content: center;
      }
      .shipping-meta .row-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .shipping-meta .ship-label {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.6px;
      }
      .shipping-meta.free .ship-label {
        background: linear-gradient(135deg, #16a34a, #22c55e);
        -webkit-background-clip: text;
        color: transparent;
      }
      .shipping-meta .ship-amount {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: var(--color-text);
      }
      .shipping-meta .ship-amount.free {
        color: var(--color-success, #16a34a);
      }
      .shipping-meta .row-sub {
        font-size: 0.55rem;
        font-weight: 600;
        letter-spacing: 0.35px;
        color: var(--color-text-muted);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .shipping-meta .achieved {
        color: var(--color-success, #15803d);
        text-transform: uppercase;
        letter-spacing: 0.45px;
      }
      .shipping-meta .remaining strong {
        color: var(--color-primary);
      }
      .shipping-meta .remaining {
        font-size: 0.68rem;
      }
      .subtotal-note {
        font-size: 0.55rem;
        letter-spacing: 0.4px;
        color: var(--color-text-muted);
        font-weight: 600;
        margin-top: 0.15rem;
      }
      .big-note {
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      @media (min-width: 900px) {
        .big-note {
          font-size: 0.7rem;
        }
      }
      .cart-footer-shipping {
        margin-top: 0.4rem;
        border-top: 1px solid var(--color-border);
        padding: 0.75rem 0.15rem 0;
        display: flex;
        gap: 0.75rem;
        font-size: 0.7rem;
        align-items: flex-start;
        transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
      }
      .cart-footer-shipping.free {
        background: linear-gradient(to right, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02));
        border-radius: var(--radius-md);
        padding: 0.85rem 0.6rem 0.9rem;
        border: 1px solid rgba(34, 197, 94, 0.35);
      }
      .cart-footer-shipping.due {
        background: linear-gradient(90deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.04));
        border-radius: var(--radius-md);
        padding: 0.85rem 0.6rem 0.9rem;
        border: 1px solid rgba(220, 38, 38, 0.35);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
      }
      .cart-footer-shipping.due .ship-label {
        color: #dc2626;
      }
      .cart-footer-shipping.due .remaining strong {
        color: #dc2626;
      }
      .cart-footer-shipping.due .ship-progress .bar {
        background: linear-gradient(90deg, #dc2626, #f97316);
      }
      .cart-footer-shipping .ship-icon img {
        width: 42px;
        height: 42px;
        object-fit: contain;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
        background: var(--color-primary-soft);
        padding: 6px;
        border-radius: 10px;
      }
      .cart-footer-shipping .ship-line {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .cart-footer-shipping .ship-label {
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.65px;
      }
      .cart-footer-shipping.free .ship-label {
        background: linear-gradient(135deg, #16a34a, #22c55e);
        -webkit-background-clip: text;
        color: transparent;
      }
      .cart-footer-shipping .ship-amount {
        font-size: 0.8rem;
        font-weight: 700;
      }
      .cart-footer-shipping .ship-amount.free {
        color: var(--color-success, #16a34a);
      }
      .cart-footer-shipping .ship-sub {
        margin-top: 0.35rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.65rem;
      }
      .cart-footer-shipping .ship-sub .remaining {
        font-size: 0.72rem;
      }
      .cart-footer-shipping .ship-sub .achieved {
        color: var(--color-success, #15803d);
        font-size: 0.7rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .cart-footer-shipping .ship-sub .big-note {
        opacity: 0.9;
      }
      .ship-progress.footer {
        margin-top: 0.2rem;
        height: 5px;
      }
      .ship-progress {
        margin-top: 0;
        height: 4px;
        width: 100%;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.05));
        border-radius: 3px;
        overflow: hidden;
        position: relative;
      }
      .ship-progress.compact {
        height: 4px;
      }
      .ship-progress .bar {
        height: 100%;
        background: linear-gradient(
          90deg,
          var(--color-primary) 0%,
          var(--color-primary-accent, #2563eb) 100%
        );
        transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      }
      .qty-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.25rem;
        font-size: 0.63rem;
        flex-wrap: wrap;
      }
      .qty-btn {
        background: var(--color-primary-soft, rgba(0, 0, 0, 0.06));
        border: 1px solid var(--color-border);
        color: var(--color-text);
        width: 24px;
        height: 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      .qty-btn:hover,
      .qty-btn:focus {
        background: var(--color-primary);
        color: #fff;
        outline: none;
      }
      .qty-btn:active {
        transform: translateY(1px);
      }
      .qty-val {
        min-width: 1.4rem;
        text-align: center;
        font-weight: 700;
        font-size: 0.7rem;
      }
      .line-total {
        font-weight: 600;
        margin-left: 0.25rem;
        font-size: 0.6rem;
        color: var(--color-text-muted);
      }
      .unit-line {
        color: var(--color-text-muted);
        font-size: 0.55rem;
        font-weight: 600;
        letter-spacing: 0.3px;
      }
      @keyframes subtlePulse {
        0%,
        100% {
          opacity: 0.82;
        }
        50% {
          opacity: 1;
        }
      }
      .shipping-row.shipping-free {
        background: linear-gradient(to right, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02));
        border-radius: var(--radius-sm);
      }
      @keyframes freePulse {
        0%,
        100% {
          filter: brightness(1);
          transform: translateY(0);
        }
        50% {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }
      }
      .img-tooltip {
        position: absolute;
        top: -4px;
        left: 56px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 4px;
        box-shadow: var(--elev-3, 0 6px 24px rgba(0, 0, 0, 0.18));
        display: none;
        z-index: 10;
        pointer-events: none;
      }
      .img-tooltip.up {
        top: auto;
        bottom: -4px;
        transform: translateY(100%);
      }
      .img-tooltip img {
        width: 170px;
        height: 170px;
        object-fit: cover;
        border-radius: var(--radius-sm);
      }
      .thumb:hover .img-tooltip,
      .thumb:focus-within .img-tooltip {
        display: block;
      }
      @media (max-width: 640px) {
        .img-tooltip {
          display: none !important;
        }
      }
      .thumb.mobile-active {
        outline: 2px solid var(--color-primary);
        border-radius: var(--radius-sm);
      }
      .mobile-center-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0.5rem 0.5rem 0.6rem;
        animation: fadeIn 0.18s ease;
        z-index: 40;
        pointer-events: none;
      }
      .mobile-center-spacer {
        flex: 1;
        height: 100%;
        pointer-events: none;
      }
      .mobile-center-content {
        pointer-events: auto;
        position: relative;
        background: var(--color-surface);
        padding: 0.5rem 0.55rem 0.65rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--elev-3, 0 6px 24px rgba(0, 0, 0, 0.25));
        animation: scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 50%;
        margin-right: 60px;
      }
      .mobile-center-content img {
        max-width: 44vw;
        max-height: 38vh;
        width: 100%;
        height: auto;
        display: block;
        border-radius: var(--radius-md);
        object-fit: cover;
      }
      .overlay-close {
        position: absolute;
        top: 0.35rem;
        right: 0.35rem;
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-size: 1.1rem;
        cursor: pointer;
      }
      .overlay-close:hover,
      .overlay-close:focus {
        color: var(--color-text);
      }
      @media (min-width: 641px) {
        .mobile-center-overlay {
          display: none;
        }
      }
      .items .info {
        flex: 1;
        font-size: 0.75rem;
        display: flex;
        flex-direction: column;
      }
      .items button {
        background: none;
        border: none;
        color: #c00;
        cursor: pointer;
        font-size: 1rem;
        padding: 0.25rem;
      }
      .total {
        display: none;
      }
      .actions {
        display: none;
      }
      @media (max-width: 640px) {
        .cart-backdrop {
          align-items: flex-end;
          justify-content: center;
        }
        .cart-panel {
          width: 100%;
          max-width: 480px;
          margin: 0 0 0 0;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          max-height: 70vh;
        }
      }
      @keyframes slideUp {
        from {
          transform: translateY(16px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from {
          transform: scale(0.92);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      @keyframes cartBump {
        0% {
          transform: scale(1);
        }
        25% {
          transform: scale(1.15);
        }
        55% {
          transform: scale(0.94);
        }
        80% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
    `,
  ],
})
export class CartFabComponent {
  cart = inject(CartService);
  private readonly router = inject(Router);

  finalizarCompra() {
    this.toggle(false); // Close cart before navigating
    this.router.navigate(['/checkout']);
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 640px)').matches;
  }
  open = false;
  mobilePreviewId: string | null = null; // retained for outline class toggle
  mobileOverlayUrl: string | null = null;
  // Two-step destructive action confirmation flag
  confirmClear = false;
  fixedTooltipVisible = false;
  fixedTooltipImgUrl: string | null = null;
  onThumbEnter(_index: number, item: any) {
    this.fixedTooltipVisible = true;
    this.fixedTooltipImgUrl = item.imageUrl;
  }
  onThumbLeave() {
    this.fixedTooltipVisible = false;
    this.fixedTooltipImgUrl = null;
  }
  remainingToFree(): number {
    const sub = this.cart.subtotal();
    const remaining = 60 - sub;
    return remaining > 0 ? remaining : 0;
  }
  coreItemCount(): number {
    // count excluding shipping synthetic row
    return this.cart.items().filter((i) => i.id !== '__shipping__').length;
  }
  inc(id: string, current: number, size?: string) {
    this.cart.setQuantity(id, current + 1, size);
  }
  dec(id: string, current: number, size?: string) {
    if (current <= 1) {
      this.cart.remove(id, size);
    } else {
      this.cart.setQuantity(id, current - 1, size);
    }
  }
  constructor() {
    // bump animation on quantity increase
    effect(() => {
      const q = this.cart.totalQuantity();
      if (q > 0) {
        // trigger animation by toggling a class on next frame
        requestAnimationFrame(() => {
          const btn = document.querySelector('.cart-fab');
          if (btn) {
            btn.classList.remove('bump');
            // force reflow
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (btn as HTMLElement).offsetWidth;
            btn.classList.add('bump');
          }
        });
      }
    });
  }
  remove(id: string, size?: string) {
    this.cart.remove(id, size);
    if (this.mobilePreviewId === id) {
      this.mobilePreviewId = null;
      this.mobileOverlayUrl = null;
    }
  }
  clear() {
    this.cart.clear();
  }
  // Begin clear confirmation flow
  startClearConfirm() {
    if (this.cart.items().length === 0) return;
    this.confirmClear = true;
  }
  // Cancel clear confirmation flow
  cancelClearConfirm() {
    this.confirmClear = false;
  }
  // Execute clear after user confirms
  doClearConfirm() {
    this.cart.clear();
    this.confirmClear = false;
  }
  toggle(val?: boolean) {
    this.open = val ?? !this.open;
    if (this.open) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
      this.mobilePreviewId = null;
      this.mobileOverlayUrl = null;
    }
  }
  closeIfBackdrop(ev: Event) {
    this.toggle(false);
  }
  // onView removed: replaced with hover tooltip preview
  openMobileOverlay(item: { id: string; imageUrl: string }, ev: Event) {
    if (!window.matchMedia('(max-width: 640px)').matches) return; // desktop handled by tooltip
    ev.stopPropagation();
    if (this.mobilePreviewId === item.id) {
      // toggle off
      this.mobilePreviewId = null;
      this.mobileOverlayUrl = null;
    } else {
      this.mobilePreviewId = item.id;
      this.mobileOverlayUrl = item.imageUrl;
    }
  }
  closeMobileOverlay(ev?: Event) {
    ev?.stopPropagation();
    this.mobilePreviewId = null;
    this.mobileOverlayUrl = null;
  }
  onPanelClick(ev: Event) {
    ev.stopPropagation();
    if (!window.matchMedia('(max-width: 640px)').matches) return;
    if (!this.mobileOverlayUrl) return;
    const target = ev.target as HTMLElement;
    if (!target.closest('.thumb') && !target.closest('.mobile-center-content')) {
      this.closeMobileOverlay();
    }
  }
  displayItems() {
    return this.cart.items().filter((i) => i.id !== '__shipping__');
  }
}
