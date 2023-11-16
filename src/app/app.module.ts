import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './components/buttons/buttons.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { WelcomeContentComponent } from './components/welcome-content/welcome-content.component';
import { AuthContentComponent } from './components/auth-content/auth-content.component';
import { ContentComponent } from './components/content/content.component';

import { AxiosService } from './axios.service';

@NgModule({
  declarations: [
    AppComponent,
    ButtonsComponent,
    LoginFormComponent,
    WelcomeContentComponent,
    AuthContentComponent,
    ContentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [AxiosService],
  bootstrap: [AppComponent]
})
export class AppModule { }
