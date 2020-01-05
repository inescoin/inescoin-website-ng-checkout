import { Component, OnInit, Input } from '@angular/core';

import { HttpService } from '../../../services/http.service';
import { inescoinConfig } from '../../../config/inescoin.config';

@Component({
  selector: 'inescoin-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit {
  @Input() paymentInfo: any = {};

	inescoinConfig = inescoinConfig;

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

  intervalID: any;

  constructor(private httpService: HttpService) {}

  ngOnInit() {
  	console.log('ngOnInit', this.paymentInfo);
  	this.checkoutData.amount = this.paymentInfo.inescoinTotal;
  	this.checkoutData.address = this.paymentInfo.walletAddress;
  	this.checkoutData.walletId = this._generateSKU() ;

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

  		console.log('wallet', wallet);
  	});

  	this.subjects._getNodeStatus = this._getNodeStatus().subscribe((node) => {
  		this.node = node;
  		console.log('status', node);
  	});
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
