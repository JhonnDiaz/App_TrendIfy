import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface UserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    direccion:string;
    contraseña:string;
  };
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading=false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.isLoading=true;

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    // Realiza la solicitud al backend
    this.http
      .get<UserResponse>(`http://localhost:3000/login`, {
        params: { email, password },
      })
      .subscribe(
        async (response) => {
         
          console.log('Login exitoso', response);
          await this.authService.setUser(response.user);
          console.log(response.user);
           this.isLoading=false;
          this.authService.presentAlert('¡Bienvenido de nuevo!','Tu inicio de sesión fue exitoso. Nos alegra verte de nuevo. Prepárate para explorar todo lo que tenemos para ti.','/home')
       
        },
        (error) => {
          this.isLoading=false;
          console.error('Error en el login', error);
         this.authService.presentAlert('Error al iniciar sesión','Hubo un problema al intentar iniciar sesión. Verifica tus credenciales e inténtalo nuevamente. Si el problema persiste, revisa tu conexión a internet o contacta con soporte.','');
        }
      );
  }
}
