import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  adminLoginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.adminLoginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.adminLoginForm.value);
    let username = this.adminLoginForm.get('username')?.value;
    let password = this.adminLoginForm.get('password')?.value;

    // Simple hardcoded check for demonstration purposes
    if (username === 'VeetuAdmin' && password === 'IamVeetuAdmin@2026') {
      localStorage.setItem('adminLoggedIn', 'true');
      this.router.navigate(['/']);
    } else {
      alert('Invalid credentials. Please try again.');
    }
    // if (this.adminLoginForm.valid) {
    //   // For testing purposes, assume login is successful
    //   localStorage.setItem('adminLoggedIn', 'true');
    //   this.router.navigate(['/']);
    // }
  }
}