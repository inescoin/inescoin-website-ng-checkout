import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'inescoin-checkout-summary',
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss']
})
export class CheckoutSummaryComponent implements OnInit {
	@Output() onStartPayment = new EventEmitter();

	@Input() cart = [];
	@Input() walletAddress = '';
	@Input() checkout: any = {};

  constructor() { }

  ngOnInit() {
  	this.checkout.walletAddress = this.walletAddress;

  	this.checkout.products = this.cart;

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
		this.checkout.total = 0;
		this.checkout.vat = 0;
		this.checkout.totalWithoutVat = 0;

		for (let i = this.checkout.products.length - 1; i >= 0; i--) {
			let total = this.checkout.products[i].amount * this.checkout.products[i].quantity;
			let percent = 0;

			this.checkout.totalWithoutVat += total;

			if (this.checkout.products[i].vat) {
				percent = this.checkout.products[i].amount / 100 * this.checkout.products[i].vat;
				total = total + percent;
				this.checkout.vat += percent * this.checkout.products[i].quantity;
			}

			this.checkout.total += total;
		}

		this.checkout.total = Number.parseFloat((this.checkout.total).toString()).toFixed(2);

		this.checkout.inescoinTotal = Number.parseFloat((this.checkout.total / this.checkout.inescoinPrice).toString()).toFixed(2);

		this.checkout.vat = Number.parseFloat((this.checkout.vat).toString()).toFixed(2);
		this.checkout.totalWithoutVat = Number.parseFloat((this.checkout.totalWithoutVat).toString()).toFixed(2);
	}

	startPayment() {
		this.onStartPayment.emit(this.checkout);
	}

	removeProduct(product) {
		_.remove(this.checkout.products, {
			sku: product.sku
		});

		this.initTotal();
  	this._saveCart();
	}

	getProductTotalPrice(product: any, total?) {
		let price = total ? product.amount * product.quantity : product.amount * 1.00;

		let percent = 0.00;
		if (product.vat) {
			console.log(product);
			percent = price / 100 * product.vat;
			price = price + percent;
		}

		let prefix = product.currency && product.currency === 'usd' ? '$' : '';
		let suffix = product.currency && product.currency === 'eur' ? ' €' : '';
		return prefix + (Number.parseFloat((price).toString()).toFixed(2)) + suffix;
	}

	getProductTotalPriceVat(product, total?) {
		let price = total ? product.amount * product.quantity : product.amount;
		return product.vat ? ' (VAT ' + product.vat + '%)' : '';
	}

	private _saveCart() {
	    let cart = {};
	    for (let product of this.checkout.products) {
	      cart[product.sku] = product;
	    }

	    localStorage.setItem('inescoin-cart', JSON.stringify(cart));
  	}
}
