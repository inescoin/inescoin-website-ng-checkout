import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'inescoin-checkout-summary',
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss']
})
export class CheckoutSummaryComponent implements OnInit {
	@Input() walletAddress = '';
	@Output() onStartPayment = new EventEmitter();
	@Input() cart = [];

	model: any = {
		walletId: 'DLS-000001',
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

  constructor() { }

  ngOnInit() {
  	this.model.walletAddress = this.walletAddress;

  	this.model.products = this.cart;

  	this.initTotal();
  }

  quantityDecrement(product) {
  	(product.quantity - 1) && product.quantity--;

  	this.initTotal();
  	this._saveCart();
  }

	quantityIncrement(product) {
		product.quantity++;

		this.initTotal();
  	this._saveCart();
	}

	initTotal() {
		this.model.total = 0;
		this.model.vat = 0;
		this.model.totalWithoutVat = 0;

		for (let i = this.model.products.length - 1; i >= 0; i--) {
			let total = this.model.products[i].amount * this.model.products[i].quantity;
			let percent = 0;

			this.model.totalWithoutVat += total;

			if (this.model.products[i].vat) {
				percent = this.model.products[i].amount / 100 * this.model.products[i].vat;
				total = total + percent;
				this.model.vat += percent * this.model.products[i].quantity;
			}

			this.model.total += total;
		}

		this.model.total = Number.parseFloat((this.model.total).toString()).toFixed(2);

		this.model.inescoinTotal = Number.parseFloat((this.model.total / this.model.inescoinPrice).toString()).toFixed(2);

		this.model.vat = Number.parseFloat((this.model.vat).toString()).toFixed(2);
		this.model.totalWithoutVat = Number.parseFloat((this.model.totalWithoutVat).toString()).toFixed(2);
	}

	startPayment() {
		this.onStartPayment.emit(this.model);
	}

	removeProduct(product) {
		_.remove(this.model.products, {
			sku: product.sku
		});

		this.initTotal();
  	this._saveCart();
	}

	getProductTotalPrice(price, currency?) {
		let prefix = currency && currency === 'usd' ? '$' : '';
		let suffix = currency && currency === 'eur' ? ' €' : '';
		return prefix + (Number.parseFloat((price).toString()).toFixed(2)) + suffix;
	}

	private _saveCart() {
    let cart = {};
    for (let product of this.model.products) {
      cart[product.sku] = product;
    }

    localStorage.setItem('inescoin-cart', JSON.stringify(cart));
  }
}
