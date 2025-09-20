import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { CartService } from '../services/cart.service';

export const cartNotEmptyGuard: CanActivateFn = (route, state) => {
  const cart = new CartService();
  return cart.items().length > 0;
};
