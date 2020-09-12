import {AfterContentChecked, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = 'Toast Master Management';
  loginLabel: string ="Login";
  isLogined: boolean = false;

  ngOnInit(): void {

  }
  ngAfterContentChecked(){
    if (localStorage.getItem('user')) {
      this.loginLabel = 'Logout';
      this.isLogined = false;
    }
    else {
      this.loginLabel = 'Login';
      this.isLogined=true;
    }
  }
}
