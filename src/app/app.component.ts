import {AfterContentChecked, Component, OnInit} from '@angular/core';
import Util from './utility/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = 'Toast Master Management';
  loginLabel = 'Login';
  isLogined = false;

  ngOnInit(): void {

  }
  ngAfterContentChecked(){
    // if (localStorage.getItem('user')) {
    if (Util.getCookie('user')) {
      this.loginLabel = 'Logout';
      this.isLogined = false;
    }
    else {
      this.loginLabel = 'Login';
      this.isLogined = true;
    }
  }
}
