import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  adminLoginForm: FormGroup;
  loginError = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.adminLoginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.adminLoginForm.invalid) {
      return;
    }

    const username = this.adminLoginForm.get('username')?.value;
    const password = this.adminLoginForm.get('password')?.value;

    const { username: adminUser, password: adminPass } = environment.adminCredentials;

    if (username === adminUser && password === adminPass) {
      this.loginError = false;
      localStorage.setItem('adminLoggedIn', 'true');
      this.router.navigate(['/']);
    } else {
      this.loginError = true;
    }
  }
}
