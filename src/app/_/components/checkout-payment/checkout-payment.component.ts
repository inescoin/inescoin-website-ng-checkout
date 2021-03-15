import { Component, OnInit, Input } from '@angular/core';

import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';

import { HttpService } from '../../../services/http.service';
import { inescoinConfig } from '../../../config/inescoin.config';

import * as _ from 'lodash';

@Component({
  selector: 'inescoin-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit {
  @Input() paymentInfo: any = {};
  @Input() walletAddress = '';
  @Input() cart = [];
  @Input() checkout: any = {};

	inescoinConfig = inescoinConfig;

  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

	qrCodeString: string = '';

	transferHash: any = '';

  checkoutData: any = {
  	// amount: 3.0233,
  	// walletId: '1f-ee-07',
  	// address: '0x8Fa2F8342E34cb63d78eb76415857B4a7Cd767Cd',
  	// confirmations: 10,
  	// callbackUrl: ''
  }

  node: any = {};
  wallet: any = {}
  transfer: any = {};
  subjects: any = {};
  qrCode: any[] = [];

  intervalID: any;

  limitProducts = 6;

  constructor(private httpService: HttpService) {}

  ngOnInit() {
  	//console.log('ngOnInit', this.paymentInfo);
  	this.checkoutData.amount = this.paymentInfo.inescoinTotal;
  	this.checkoutData.address = this.paymentInfo.walletAddress;
    this.paymentInfo.walletId = this.paymentInfo.walletId || this._generateSKU();


    this.checkoutData.walletId = this.paymentInfo.walletId;
    console.log(this.checkout);
    // this.checkoutData.extra = JSON.stringify(this.checkout);
    let products = [];
    let keyPos = 0;
    products[keyPos] = [];
    let productsLength = 0;

    for (var i = 0; i < this.checkout.products.length; i++) {
      products[keyPos].push(this.checkout.products[i]);
      if (productsLength % this.limitProducts === 0 && productsLength !== 0) {
        keyPos++;
        products[keyPos] = [];
        products[keyPos].push(this.checkout.products[i]);
      }
      productsLength++;
    }

    // this.checkoutData.products = this.checkout.products.map((product) => {
    //   return {
    //     sku: product.sku,
    //     quantity: product.quantity,
    //   }
    // });

    this.qrCode = [];

    for (var i = 0; i < products.length; i++) {
      let checkout: any = {
        total: 0.00,
        vat: 0.00,
        totalWithoutVat: 0.00,
        inescoinTotal: 0.00
      };

      for (var y = 0; y < products[i].length; y++) {
        let percent = 0.00;
        let total: any = products[i][y].amount * products[i][y].quantity;

        checkout.totalWithoutVat += total;

        if (products[i][y].vat) {
          percent = products[i][y].amount / 100 * products[i][y].vat;
          total = total + percent;
          checkout.vat += percent * products[i][y].quantity;
        }

        checkout.total += Number.parseFloat((total).toString());

        // checkout.inescoinTotal += total * this.checkout.inescoinPrice;
        checkout.inescoinTotal += total / this.checkout.inescoinPrice;
      }

      checkout.inescoinTotal = checkout.inescoinTotal.toFixed(3);
      checkout.walletId = this.paymentInfo.walletId;
      // checkout.inescoinTotal = checkout.inescoinTotal.toFixed(3);

      let payment: any = {
        customer: this.checkout.customer,
        billing: this.checkout.billing,
        shipping: this.checkout.shipping,
        products: products[i],
        checkout: checkout,
      };

      let _products = _.cloneDeep(payment.products);

      payment.products = payment.products.map((product) => {
        return {
          sku: product.sku,
          quantity: product.quantity,
        }
      });

      payment.qrCode = JSON.stringify(payment);
      payment.products = _products;

      this.qrCode.push(payment);
    }

    console.log(this.qrCode);

    this.checkoutData.customer = this.checkout.customer;
    this.checkoutData.billing = this.checkout.billing;
    this.checkoutData.shipping = this.checkout.shipping;

    this.qrCodeString = JSON.stringify(this.checkoutData);

  	this._load();
  	this.intervalID = setInterval(() => {
  		this._load();
  	}, 10000)
  }

  ngOnDestroy() {
  	this._clear();

  	if (this.intervalID) {
  		clearInterval(this.intervalID);
  	}
  }

  private _load() {
  	this._clear();

  	this.subjects._getWalletInfos = this._getWalletInfos().subscribe((wallet: any) => {
  		this.wallet = wallet;
  		let transfers = wallet.transfers.transactions;
  		let len = transfers.length;
  		if (len) {
  			for (let i= 0; i < len; i++) {
  				if (transfers[i].to === this.checkoutData.address
  					&& transfers[i].amount === this.checkoutData.amount * 1000000000
  					&& transfers[i].walletId === this.checkoutData.walletId) {
  					this.transfer = transfers[i];

  					if (this.node.height - this.transfer.height >= this.checkoutData.confirmations) {
  						clearInterval(this.intervalID);
  					}
  				}
  			}
  		}
  		// console.log('wallet', wallet);
  	});

  	this.subjects._getNodeStatus = this._getNodeStatus().subscribe((node) => {
  		this.node = node;
  		// console.log('status', node);
  	});
  }

  getProductTotalPrice(product: any, total?) {
    let price = total ? product.amount * product.quantity : product.amount * 1.00;

    let percent = 0.00;
    if (product.vat) {
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

  private _clear() {
  	this.subjects._getWalletInfos && this.subjects._getWalletInfos.unsubscribe();
  	this.subjects._getNodeStatus && this.subjects._getNodeStatus.unsubscribe();
  }

  private _getWalletInfos() {
    return this.httpService.post('get-wallet-address-infos', {
      walletAddress: this.checkoutData.address
    })
  }

  private _getNodeStatus() {
    return this.httpService.get('status');
  }

  private _generateSKU() {
    return Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Math.floor(Date.now() / 1000);
  }


}
