import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule, Http } from '@angular/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DoorgetsTranslateModule , NgTranslate, NgTranslateAbstract } from 'doorgets-ng-translate';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { CheckoutPaymentComponent } from './_/components/checkout-payment/checkout-payment.component';
import { CheckoutSummaryComponent } from './_/components/checkout-summary/checkout-summary.component';

export function newNgTranslate(http: HttpClient) {
  return new NgTranslate(http, '../../assets/public/locale');
}

registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    CheckoutPaymentComponent,
    CheckoutSummaryComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    NgxQRCodeModule,
    HttpClientModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    DoorgetsTranslateModule.forRoot({
      provide: NgTranslateAbstract,
      useFactory: (newNgTranslate),
      deps: [Http]
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
