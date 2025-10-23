import {
  ChangeDetectionStrategy,
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';

declare let grecaptcha: any;
@Component({
  standalone: true,
  selector: 'checkout-page',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="checkout-page" (click)="onPanelClick($event)">
      <button type="button" class="back-btn" (click)="showBackConfirm = true">← Voltar</button>
      @if (showBackConfirm) {
      <div class="back-confirm-overlay" (click)="showBackConfirm = false">
        <div class="back-confirm-dialog" (click)="$event.stopPropagation()">
          <div class="back-confirm-title">Tem a certeza que quer voltar?</div>
          <div class="back-confirm-desc">Se voltar, os dados preenchidos podem ser perdidos.</div>
          <div class="back-confirm-actions">
            <button
              type="button"
              class="back-confirm-btn back-confirm-ok"
              (click)="goBack(); showBackConfirm = false"
            >
              Sim, voltar
            </button>
            <button
              type="button"
              class="back-confirm-btn back-confirm-cancel"
              (click)="showBackConfirm = false"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      }
      <h2 class="checkout-title">Finalizar Compra</h2>
      <div class="checkout-summary">
        <h3 class="summary-title">Resumo do Carrinho</h3>
        <div class="summary-list">
          @for (item of cart.items(); track item.id; let i = $index) {
          <div class="summary-item" [class.shipping-row]="item.id === '__shipping__'">
            <span
              class="thumb"
              (click)="openMobileOverlay(item, $event)"
              [class.mobile-active]="mobilePreviewId === item.id"
            >
              @if (item.id === '__shipping__') {
              <img
                class="summary-img"
                src="assets/images/icons/shipping.svg"
                alt="Portes de Envio"
              />
              } @else {
              <img class="summary-img" [src]="item.imageUrl" alt="{{ item.name }}" />
              <span class="img-tooltip"
                ><img [src]="item.imageUrl" alt="Pré-visualização" width="170" height="170"
              /></span>
              }
            </span>
            <div class="summary-info">
              <div class="summary-name">
                @if (item.id === '__shipping__') {
                {{ item.name.toUpperCase() }}
                } @else {
                {{ (item.name + (item.size ? ' ' + item.size : '')).toUpperCase() }}
                }
              </div>
              <div class="summary-qty">
                Quantidade: <span>{{ item.qty }}</span>
              </div>
              <div class="summary-price">
                Preço: <span>{{ item.price }} €</span>
              </div>
              <div class="summary-line-total">
                Subtotal: <span>{{ (item.qty * item.price).toFixed(2) }} €</span>
              </div>
            </div>
          </div>
          }
        </div>
        <div class="summary-totals">
          <div class="summary-item-count">
            Total de itens: <span>{{ cart.totalQuantity() }}</span>
          </div>
          <div class="summary-total">
            Total: <span>{{ cart.totalPrice().toFixed(2) }} €</span>
          </div>
        </div>
      </div>
      @if (mobileOverlayUrl) {
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
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="checkout-form" novalidate>
        <div class="contact-section">
          <h4 class="contact-title">
            Contacto <span class="contact-note">(pelo menos um campo obrigatório)</span>
          </h4>
          @if (form.hasError('atLeastOneContact') && form.touched) {
          <div class="error contact-error">Deve preencher pelo menos um método de contacto</div>
          }
        </div>
        <div class="form-row">
          <label>Nome do seu perfil do Facebook</label>
          <input formControlName="facebook" />
        </div>
        <div class="form-row">
          <label>Número de telemóvel/WhatsApp</label>
          <input
            formControlName="phone"
            placeholder="Ex: 912345678, 965432100, +351912345678"
            inputmode="numeric"
            pattern="[0-9+ ]*"
            (input)="restrictPhoneInput($event)"
          />
          @if (form.controls.phone.value && form.controls.phone.invalid &&
          form.controls.phone.touched) {
          <div class="error">
            @if (form.controls.phone.hasError('invalidPhone')) { Número inválido. Use formato
            português: 9XXXXXXXX ou +351 9XXXXXXXX } @else { Número de telemóvel inválido }
          </div>
          }
        </div>
        <div class="form-row">
          <label>Email</label>
          <input formControlName="email" />
          @if (form.controls.email.value && form.controls.email.invalid &&
          form.controls.email.touched) {
          <div class="error">
            @if (form.controls.email.hasError('invalidEmail')) { Email deve ter formato válido
            (exemplo@dominio.com) } @else { Email inválido }
          </div>
          }
        </div>
        <div class="address-section">
          <h4 class="address-title">Morada de Entrega</h4>
          <div class="form-row">
            <label>Rua/Avenida e Número</label>
            <input formControlName="street" placeholder="Ex: Rua das Flores, 123, 2º Esq" />
          </div>
          <div class="form-row-group">
            <div class="form-row form-row-half">
              <label>Código Postal</label>
              <input
                formControlName="postalCode"
                placeholder="0000-000"
                maxlength="8"
                (input)="formatPostalCode($event)"
              />
              @if (form.controls.postalCode.value && form.controls.postalCode.invalid &&
              form.controls.postalCode.touched) {
              <div class="error">Formato: 0000-000</div>
              }
            </div>
            <div class="form-row form-row-half">
              <label>Localidade</label>
              <input formControlName="city" placeholder="Ex: Lisboa, Porto, Braga, Coimbra..." />
            </div>
          </div>
          <div class="form-row">
            <!-- Distrito field removed -->
          </div>
        </div>
        <div class="form-row" style="margin-bottom:1.2rem;">
          <!-- Google reCAPTCHA widget -->
          <div id="recaptcha-container"></div>
          <div *ngIf="recaptchaError" class="error">Por favor, confirme que não é um robô.</div>
        </div>
        <button type="submit" [disabled]="form.invalid || sending" class="submit-btn">
          @if (sending) {
          <span class="spinner"></span> A enviar... } @else { Enviar Pedido }
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .spinner {
        display: inline-block;
        width: 1.1em;
        height: 1.1em;
        border: 2.5px solid #fff;
        border-top: 2.5px solid var(--color-primary-accent, #2563eb);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        vertical-align: middle;
        margin-right: 0.7em;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5em;
        background: var(
          --color-primary-gradient,
          linear-gradient(90deg, #0d5fa6 60%, #1286c7 100%)
        );
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.7em 1.3em;
        font-size: 1.08rem;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        margin-bottom: 1.2rem;
        transition: background 0.18s, box-shadow 0.18s;
        outline: none;
      }
      .back-btn:hover,
      .back-btn:focus {
        background: var(
          --color-primary-gradient,
          linear-gradient(90deg, #1286c7 60%, #0d5fa6 100%)
        );
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }
      .back-confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        animation: fadeIn 0.18s ease;
      }
      .back-confirm-dialog {
        background: var(--color-surface);
        border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        padding: 2.2em 2em 1.5em;
        min-width: 320px;
        max-width: 90vw;
        text-align: center;
        animation: scaleIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .back-confirm-title {
        font-size: 1.18rem;
        font-weight: 800;
        margin-bottom: 0.7em;
        color: var(--color-primary-accent);
      }
      .back-confirm-desc {
        font-size: 1.02rem;
        color: var(--color-text-muted);
        margin-bottom: 1.2em;
      }
      .back-confirm-actions {
        display: flex;
        gap: 1.2em;
        justify-content: center;
      }
      .back-confirm-btn {
        padding: 0.6em 1.2em;
        border-radius: 8px;
        border: none;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background 0.18s, color 0.18s;
      }
      .back-confirm-cancel {
        background: #fff;
        color: var(--color-primary);
        border: 1px solid var(--color-primary-accent);
        transition: background 0.18s, color 0.18s, border 0.18s;
      }
      .back-confirm-cancel:hover,
      .back-confirm-cancel:focus {
        background: #f3f4f6;
        color: var(--color-primary) !important;
        border: 1.5px solid var(--color-primary-accent);
        box-shadow: 0 2px 8px rgba(255, 138, 36, 0.08);
      }
      .back-confirm-ok {
        background: var(--color-primary);
        color: #fff;
        border: 1px solid var(--color-primary);
        font-weight: 800;
        box-shadow: 0 2px 8px rgba(13, 95, 166, 0.1);
        transition: background 0.18s, color 0.18s, border 0.18s;
      }
      .back-confirm-ok:hover,
      .back-confirm-ok:focus {
        background: #0a4d85;
        color: #fff !important;
        border: 1px solid #0a4d85;
      }
      .thumb {
        position: relative;
        display: inline-block;
      }
      .img-tooltip {
        position: absolute;
        top: -4px;
        left: 64px;
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
      .thumb.mobile-active {
        outline: 2px solid var(--color-primary);
        border-radius: 8px;
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
        border-radius: 12px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
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
        border-radius: 8px;
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
      .checkout-page {
        max-width: 540px;
        margin: 2.5rem auto;
        padding: 2.5rem 2rem;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--elev-2);
      }
      .checkout-title {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 2rem;
        text-align: center;
        letter-spacing: 0.5px;
      }
      .checkout-summary {
        margin-bottom: 2.5rem;
      }
      .summary-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 1.2rem;
        letter-spacing: 0.3px;
      }
      .summary-list {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        margin-bottom: 1.5rem;
      }
      .summary-item {
        display: flex;
        gap: 1.2rem;
        align-items: center;
        background: var(--color-primary-soft, #f3f4f6);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        box-shadow: var(--elev-1);
      }
      .summary-img {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 10px;
        background: #fff;
        border: 1px solid var(--color-border);
      }
      .summary-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .summary-name {
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: 0.7px;
        text-transform: uppercase;
        color: var(--color-primary);
      }
      .summary-size,
      .summary-qty,
      .summary-price,
      .summary-line-total {
        font-size: 0.98rem;
        color: var(--color-primary);
      }
      .summary-size span,
      .summary-qty span,
      .summary-price span,
      .summary-line-total span {
        font-weight: 600;
      }
      .summary-line-total {
        color: var(--color-primary-accent, #2563eb);
      }
      .summary-totals {
        border-top: 1px solid var(--color-border);
        padding-top: 1rem;
        margin-top: 0.5rem;
      }
      .summary-item-count {
        font-size: 1rem;
        font-weight: 600;
        text-align: right;
        margin-bottom: 0.5rem;
        color: var(--color-text);
      }
      .summary-item-count span {
        font-weight: 700;
        color: var(--color-primary);
      }
      .summary-total {
        font-size: 1.15rem;
        font-weight: 800;
        text-align: right;
        color: var(--color-primary);
      }
      .checkout-form {
        margin-top: 2.5rem;
      }
      .contact-section {
        margin-bottom: 1.5rem;
      }
      .contact-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        letter-spacing: 0.2px;
      }
      .contact-note {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-muted);
        margin-left: 0.5rem;
      }
      .contact-error {
        margin-bottom: 1rem;
      }
      .address-section {
        margin-bottom: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--color-border);
      }
      .address-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        letter-spacing: 0.2px;
      }
      .form-row-group {
        display: flex;
        gap: 1rem;
      }
      .form-row-half {
        flex: 1;
      }
      @media (max-width: 640px) {
        .form-row-group {
          flex-direction: column;
          gap: 0;
        }
      }
      .form-row {
        margin-bottom: 1.3rem;
      }
      label {
        display: block;
        font-weight: 700;
        margin-bottom: 0.35rem;
        letter-spacing: 0.2px;
      }
      .required {
        color: #dc2626;
        font-size: 1.1em;
        margin-left: 0.2em;
      }
      input,
      textarea {
        width: 100%;
        padding: 0.6rem;
        border-radius: 8px;
        border: 1px solid var(--color-border);
        font-size: 1.05rem;
        background: #fff;
      }
      textarea {
        min-height: 70px;
      }
      .error {
        color: #dc2626;
        font-size: 0.95rem;
        margin-top: 0.2rem;
        font-weight: 600;
      }
      .submit-btn {
        background: var(--color-primary);
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 1rem 1.5rem;
        font-size: 1.1rem;
        font-weight: 800;
        cursor: pointer;
        margin-top: 1.2rem;
        box-shadow: var(--elev-2);
        transition: background 0.2s;
      }
      .submit-btn:hover:not([disabled]) {
        background: var(--color-primary-accent, #2563eb);
      }
      button[disabled] {
        background: #ccc;
        cursor: not-allowed;
      }
      /* Mobile fullscreen preview overlay (applies on small screens) */
      @media (max-width: 640px) {
        .mobile-center-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(3px);
          animation: fadeIn 0.18s ease;
          z-index: 1000;
          pointer-events: auto;
        }
        .mobile-center-spacer {
          display: none;
        }
        .mobile-center-content {
          pointer-events: auto;
          position: relative;
          background: var(--color-surface);
          padding: 0.75rem 0.8rem 1rem;
          border-radius: 16px;
          box-shadow: 0 10px 34px -4px rgba(0, 0, 0, 0.55);
          animation: scaleIn 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: min(82vw, 420px);
          max-height: 82vh;
          display: flex;
          flex-direction: column;
        }
        .mobile-center-content img {
          width: 100%;
          height: auto;
          max-height: calc(82vh - 2.5rem);
          object-fit: contain;
          border-radius: 10px;
        }
        .overlay-close {
          background: rgba(0, 0, 0, 0.4);
          color: #fff;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .overlay-close:hover,
        .overlay-close:focus {
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
        }
      }
    `,
  ],
})
export class CheckoutPageComponent implements AfterViewInit, OnDestroy {
  sending = false;
  // EmailJS config (replace with your own values)
  private readonly emailServiceId = 'service_mk0tucd';
  private readonly emailTemplateId = 'template_5ys6gao';
  private readonly emailUserId = 'JlV8asmwi9qRCILML';
  showBackConfirm = false;
  private readonly router = inject(Router);
  // Fix: Use direct import for Router injection
  // Remove await and use Router type directly
  // import { Router } from '@angular/router'; at the top

  recaptchaToken: string | null = null;
  recaptchaError: boolean = false;

  ngAfterViewInit() {
    // Choose reCAPTCHA key based on environment
    const isLocalhost = window.location.hostname === 'localhost';
    const siteKey = isLocalhost
      ? '6Lfius8rAAAAAAUbSeRKnhoLdMCnazh-nKv97tOi' // Dev key for localhost
      : '6LdVuM8rAAAAAMQaj3E5JvKthcn1Hc2Kk8kyJCXe'; // Prod key for GitHub Pages

    // Load reCAPTCHA script if not already loaded
    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    // Setup callback for reCAPTCHA
    (window as any).onRecaptchaLoadCallback = () => {
      grecaptcha.render('recaptcha-container', {
        sitekey: siteKey,
        callback: (token: string) => {
          this.recaptchaToken = token;
          this.recaptchaError = false;
        },
        'expired-callback': () => {
          this.recaptchaToken = null;
        },
      });
    };
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['']);
    }
  }
  restrictPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Only allow digits, spaces, +
    input.value = input.value.replace(/[^0-9+ ]/g, '');
    this.form.patchValue({ phone: input.value });
  }
  cart = inject(CartService);
  fb = inject(FormBuilder);

  // Custom email validator for more strict validation
  strictEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let the required validator handle empty values
    }

    const email = control.value;
    // More strict email pattern: requires @ and at least one dot after @
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      return { invalidEmail: true };
    }

    return null;
  }

  // Portuguese postal code validator
  postalCodeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Optional field
    }

    const postalCode = control.value;
    // Portuguese postal code format: XXXX-XXX (4 digits, dash, 3 digits)
    const postalCodePattern = /^\d{4}-\d{3}$/;

    if (!postalCodePattern.test(postalCode)) {
      return { invalidPostalCode: true };
    }

    return null;
  }

  // Portuguese phone number validator
  phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Optional field
    }

    const phone = control.value.replace(/\s/g, ''); // Remove spaces

    // Portuguese mobile phone patterns only:
    // Mobile: 9XXXXXXXX (9 digits starting with 9)
    // International mobile: +351 9XXXXXXXX or 00351 9XXXXXXXX
    const phonePatterns = [
      /^9\d{8}$/, // Mobile: 9XXXXXXXX
      /^\+3519\d{8}$/, // International mobile: +351 9XXXXXXXX
      /^003519\d{8}$/, // International mobile: 00351 9XXXXXXXX
    ];

    const isValid = phonePatterns.some((pattern) => pattern.test(phone));

    if (!isValid) {
      return { invalidPhone: true };
    }

    return null;
  }

  // Custom validator to ensure at least one contact method is provided
  atLeastOneContactValidator(control: AbstractControl): ValidationErrors | null {
    const facebook = control.get('facebook')?.value;
    const phone = control.get('phone')?.value;
    const email = control.get('email')?.value;

    if (!facebook && !phone && !email) {
      return { atLeastOneContact: true };
    }
    return null;
  }

  form = this.fb.group(
    {
      facebook: [''],
      phone: ['', this.phoneValidator],
      email: ['', this.strictEmailValidator],
      street: [''],
      postalCode: ['', this.postalCodeValidator],
      city: [''],
    },
    { validators: this.atLeastOneContactValidator }
  );
  mobilePreviewId: string | null = null;
  mobileOverlayUrl: string | null = null;
  private originalBodyOverflow = '';
  private bodyScrollLockApplied = false;
  isMobile(): boolean {
    return window.matchMedia('(max-width: 640px)').matches;
  }
  onThumbEnter(_index: number, item: any) {
    // No-op: tooltip is handled by CSS hover, not state
  }
  onThumbLeave() {
    // No-op: tooltip is handled by CSS hover, not state
  }
  openMobileOverlay(item: { id: string; imageUrl: string }, ev: Event) {
    if (!window.matchMedia('(max-width: 640px)').matches) return;
    ev.stopPropagation();
    if (this.mobilePreviewId === item.id) {
      this.mobilePreviewId = null;
      this.mobileOverlayUrl = null;
      this.releaseBodyScroll();
    } else {
      this.mobilePreviewId = item.id;
      this.mobileOverlayUrl = item.imageUrl;
      this.lockBodyScroll();
    }
  }
  closeMobileOverlay(ev?: Event) {
    ev?.stopPropagation();
    this.mobilePreviewId = null;
    this.mobileOverlayUrl = null;
    this.releaseBodyScroll();
  }
  private lockBodyScroll() {
    if (this.bodyScrollLockApplied) return;
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.bodyScrollLockApplied = true;
  }
  private releaseBodyScroll() {
    if (!this.bodyScrollLockApplied) return;
    document.body.style.overflow = this.originalBodyOverflow;
    this.bodyScrollLockApplied = false;
  }
  ngOnDestroy() {
    this.releaseBodyScroll();
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
  onSubmit() {
    if (!this.recaptchaToken) {
      this.recaptchaError = true;
      return;
    }
    if (this.form.valid) {
      this.sending = true;
      // Prepare email data
      const formData = this.form.value;
      const cartItems = this.cart.items();
      const products = cartItems
        .filter((i) => i.id !== '__shipping__')
        .map(
          (i) =>
            `${i.name}${i.size ? ' (' + i.size + ')' : ''} x${i.qty} - ${i.price}€ 'subtotal - (${
              i.qty * i.price
            })'`
        )
        .join('\n');
      const shipping = cartItems.find((i) => i.id === '__shipping__');
      const total = this.cart.totalPrice().toFixed(2);

      // Simplified approach - build product list as HTML string
      const productItems = cartItems.filter((i) => i.id !== '__shipping__');
      let productListHtml = '';

      productItems.forEach((item) => {
        const itemName = item.name || 'Produto';
        const itemSize = item.size ? ` (${item.size})` : '';
        const itemQty = item.qty || 0;
        const itemPrice = item.price || 0;
        const itemSubtotal = (itemQty * itemPrice).toFixed(2);

        // Convert relative URL to absolute URL for email
        let itemImage = item.imageUrl || '';
        if (itemImage && !itemImage.startsWith('http')) {
          // Replace with your deployed site URL
          const baseUrl = 'https://lojadofilipe.github.io/loja'; // Clean URL without subdirectory
          itemImage = baseUrl + '/' + itemImage.replace(/^\//, '');
        }

        productListHtml += `
          <div style="display:flex;align-items:center;margin-bottom:1em;border-bottom:1px solid #eee;padding-bottom:0.7em;">
            <img src="${itemImage}" alt="${itemName}" style="width:44px;height:44px;border-radius:8px;border:1px solid #cdd9e3;background:#fff;margin-right:0.8em;" onerror="this.style.display='none';">
            <div>
              <div style="font-weight:700;color:#0d5fa6;">${itemName}${itemSize}</div>
              <div style="font-size:0.98em;color:#555;">
                <span>Qtd: ${itemQty}</span> &nbsp; <span>Preço: ${itemPrice} €</span>
              </div>
              <div style="font-size:0.98em;color:#2563eb;">Subtotal: ${itemSubtotal} €</div>
            </div>
          </div>
        `;
      });

      const emailParams = {
        facebook: formData.facebook || '',
        phone: formData.phone || '',
        email: formData.email || '',
        street: formData.street || '',
        postalCode: formData.postalCode || '',
        city: formData.city || '',
        products: products || '',
        shipping: shipping?.name ? `${shipping.name}: ${shipping.price}€` : 'N/A',
        total: `${total}€`,
        productListHtml: productListHtml,
        totalQuantity: this.cart.totalQuantity(),
        'g-recaptcha-response': this.recaptchaToken,
      };
      emailjs
        .send(this.emailServiceId, this.emailTemplateId, emailParams, this.emailUserId)
        .then(() => {
          this.form.reset();
          this.cart.clear();
          this.recaptchaToken = null;
          // Reset reCAPTCHA widget
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
          }
          // Show toast if available
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(
              new CustomEvent('show-toast', {
                detail: {
                  type: 'success',
                  message: 'Pedido enviado com sucesso! Obrigado pela sua compra.',
                },
              })
            );
          }
          // Redirect to confirmation page
          this.router.navigate(['/order-confirmation']);
        })
        .catch(() => {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(
              new CustomEvent('show-toast', {
                detail: {
                  type: 'error',
                  message: 'Erro ao enviar pedido. Tente novamente.',
                },
              })
            );
          }
        })
        .finally(() => {
          this.sending = false;
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  formatPostalCode(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length >= 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 7);
    }

    this.form.patchValue({ postalCode: value });
  }
}
