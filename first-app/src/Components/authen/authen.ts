import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './authen.html',
  styleUrls: ['./authen.css']
})
export class AuthComponent implements OnInit {
  isLoginMode = signal(true); 
  authForm!: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.userRole());
    }

    this.initializeForm();
  }

  initializeForm(): void {
    this.authForm = this.fb.group({
      // Common fields
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      
      
      role: ['customer'],
      firstName: [''],
      lastName: [''],
      username: [''],
      phone: [''],
      confirmPassword: ['']
    });

    this.updateValidators();
  }

  toggleMode(): void {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set('');
    this.successMessage.set('');
    this.authForm.reset({
      email: '',
      password: '',
      role: 'customer'
    });
    this.updateValidators();
  }

  updateValidators(): void {
    const firstNameControl = this.authForm.get('firstName');
    const lastNameControl = this.authForm.get('lastName');
    const usernameControl = this.authForm.get('username');
    const phoneControl = this.authForm.get('phone');
    const confirmPasswordControl = this.authForm.get('confirmPassword');

    if (this.isLoginMode()) {
      // Login mode - remove validators
      firstNameControl?.clearValidators();
      lastNameControl?.clearValidators();
      usernameControl?.clearValidators();
      phoneControl?.clearValidators();
      confirmPasswordControl?.clearValidators();
    } else {
      // Register mode - add validators
      firstNameControl?.setValidators([Validators.required]);
      lastNameControl?.setValidators([Validators.required]);
      usernameControl?.setValidators([Validators.required, Validators.minLength(3)]);
      phoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10}$/)]);
      confirmPasswordControl?.setValidators([Validators.required]);
    }

    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
    usernameControl?.updateValueAndValidity();
    phoneControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
  }

  selectRole(role: string): void {
    this.authForm.patchValue({ role });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  passwordMatchValidator(): boolean {
    if (this.isLoginMode()) return true;
    
    const password = this.authForm.get('password')?.value;
    const confirmPassword = this.authForm.get('confirmPassword')?.value;
    
    return password === confirmPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      Object.keys(this.authForm.controls).forEach(key => {
        this.authForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.isLoginMode() && !this.passwordMatchValidator()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.isLoginMode()) {
      await this.handleLogin();
    } else {
      await this.handleRegister();
    }
  }

  async handleLogin(): Promise<void> {
    const { email, password } = this.authForm.value;

    const result = await this.authService.login(email, password);

    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('Login successful! Redirecting...');
      setTimeout(() => {
        this.redirectByRole(result.user!.role);
      }, 1000);
    } else {
      this.errorMessage.set(result.message);
    }
  }

  async handleRegister(): Promise<void> {
    const formData = { ...this.authForm.value };
    delete formData.confirmPassword;

    const result = await this.authService.register(formData);

    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('Registration successful! You can now login.');
      setTimeout(() => {
        this.isLoginMode.set(true);
        this.authForm.reset({
          email: formData.email,
          password: '',
          role: 'customer'
        });
        this.updateValidators();
      }, 2000);
    } else {
      this.errorMessage.set(result.message);
    }
  }

  redirectByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'agent':
        this.router.navigate(['/agent/dashboard']);
        break;
      case 'customer':
        this.router.navigate(['/customer/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}