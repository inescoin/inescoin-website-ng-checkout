import { Component, OnInit, ElementRef } from '@angular/core';
import { inescoinConfig } from './config/inescoin.config';

import { DoorgetsTranslateService } from 'doorgets-ng-translate';

@Component({
  selector: inescoinConfig.name + '-checkout',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  walletAddress: string = '';
  showPayment: boolean = false;
  paymentInfo: any = {};

  cart: any[] = [];

  tempCart: any = {};

  checkout: any = {
    walletId: null,
    walletAddress: '',
    inescoinTotal: 0,
    total: 0,
    totalWithoutVat: 0,
    vat: 0,
    isNotSameAddress: false,
    products: [],
    customer: {},
    billing: {},
    shipping: {},
    inescoinPrice: 0.042
  }

  constructor(
    private elementRef: ElementRef,
    private doorgetsTranslateService: DoorgetsTranslateService) {
  }

  ngOnInit() {
    this.walletAddress = this.elementRef.nativeElement.getAttribute('walletAddress') || this.walletAddress;

    this.tempCart = {
      "181e3e96-317b-40e8-acc6-3d83a561a34b": {
        "title":"Turcotte-Dietrich",
        "sku":"181e3e96-317b-40e8-acc6-3d83a561a34b",
        "amount":"55",
        "currency":"usd",
        "image":"http://dummyimage.com/300x400.png/cc0000/ffffff",
        "quantity":6
      },
      "44a6b3df-5e25-4024-9a2b-f704fb4536cd": {
        "title":"Kihn, McKenzie and Heaney",
        "sku":"44a6b3df-5e25-4024-9a2b-f704fb4536cd",
        "amount":"87",
        "currency":"usd",
        "image":"http://dummyimage.com/300x400.jpg/5fa2dd/ffffff",
        "quantity":4
      },
      "5d29fd27-2b54-4aa0-9c05-3f75846fa632": {
          "title":"Schultz and Sons",
          "sku":"5d29fd27-2b54-4aa0-9c05-3f75846fa632",
          "amount":"91",
          "currency":"usd",
          "image":"http://dummyimage.com/300x400.png/ff4444/ffffff",
          "quantity":4
      }
    };

    this.doorgetsTranslateService.init({
      languages: ['en', 'fr'],
      current: 'en',
      default: 'en'
    });

    console.log('this.tempCart', this.tempCart);
    this._init();
  }

  addProduct() {
    this.cart.push({
      sku: "LMKMLKKMLK_MKLMKMLKMLKM",
      title: "Chaine Hifi",
      amount: 12.9,
      currency: "eur",
      image: "http://dummyimage.com/300x400.bmp/ff4444/ffffff",
      quantity: 1,
      vat: 20
    });

    this._saveCart();
  }

  onStartPaymentHandler(paymentInfo) {
    console.log('paymentInfo', paymentInfo);
    this.paymentInfo = paymentInfo;
    this.showPayment = true;
  }

  private _init() {
    this.tempCart = this._getCart();

    let tempCartKeys = Object.keys(this.tempCart);
    if (tempCartKeys.length) {

      for(let i of tempCartKeys) {
        this.cart.push(this.tempCart[i]);
      }

      console.log('this.cart', this.cart);
    }

  }

  private _getCart() {
    let cart = localStorage.getItem(inescoinConfig.name + '-cart');

    if (cart) {
      return JSON.parse(cart);
    }

    return {};
  }

  private _saveCart() {
    let cart = {};
    for (let product of this.cart) {
      cart[product.sku] = product;
    }

    localStorage.setItem(inescoinConfig.name + '-cart', JSON.stringify(cart));
  }
}
