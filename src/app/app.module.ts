import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgxQRCodeModule } from 'ngx-qrcode2';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule, Http } from '@angular/http';
import { CheckoutPaymentComponent } from './_/components/checkout-payment/checkout-payment.component';
import { CheckoutSummaryComponent } from './_/components/checkout-summary/checkout-summary.component';

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
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
