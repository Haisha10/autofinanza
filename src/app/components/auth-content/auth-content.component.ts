import { Component, Output, EventEmitter } from '@angular/core';
import { AxiosService } from '../../axios.service';
import { User } from 'src/app/models/user.model';
import { currentUser } from 'src/app/user-info';


@Component({
  selector: 'app-auth-content',
  templateUrl: './auth-content.component.html',
  styleUrls: ['./auth-content.component.css']
})
export class AuthContentComponent {

  @Output() logoutEvent = new EventEmitter();

  data: User = currentUser;

  constructor(private axiosService: AxiosService) {}

  ngOnInit(): void {
    /*
    this.axiosService.request(
        "GET",
        "/currentUser",
        {}).then(
        (response) => {
            this.data = response.data;
        }).catch(
        (error) => {
            if (error.response.status === 401) {
                this.axiosService.setAuthToken(null);
            } else {
                this.data = error.response.code;
            }

        }
    );
    */
  }

  scrollToElement(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({behavior: "smooth"});
  }
}
