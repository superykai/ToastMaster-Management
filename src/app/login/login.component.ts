import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import Util from '../utility/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  email: string;
  password: string;
  loading: true;

  constructor(
    private afAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // if (localStorage.getItem('user')) {
    if (Util.getCookie('user')) {
      this.logout();
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }


    // Sign in existing user
    this.afAuth.signInWithEmailAndPassword(this.f.email.value, this.f.password.value).then(u => {
      const user = u.user.email.toString();
      Util.setCookie('user', user, 1);
      // localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/']);
    })
      .catch((err) => {
        // Handle errors
        alert(err.code + ' : ' + err.message);
      });

  }

  logout() {
    // remove user from local storage and set current user to null
    Util.deleteCookie('user');
    // localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

}
