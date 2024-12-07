import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading=false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      direccion: ['',Validators.required],
      telefono: ['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.matchPasswords }); 
  }

  ngOnInit() {}

  // Validación personalizada para confirmar contraseñas
  matchPasswords(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }


  onSubmit() {
    this.isLoading=true;
    if (this.registerForm.invalid) {
      return; 
    }

    // Obtenemos los datos del formulario
    const formData = this.registerForm.value;
    const userData = {
      name: formData.name,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      password: formData.password
    };

    // Hacemos la solicitud POST al backend
    this.http.post('http://localhost:3000/register', userData)
      .subscribe(
        (response: any) => {
          this.isLoading=false;
          
          this.authService.presentAlert('¡Cuenta creada con éxito!','Gracias por registrarte. Tu cuenta está lista para usar. Comienza a disfrutar de los beneficios de ser parte de nuestra comunidad.','/login'); 
        },
        (error) => {
          console.error('Error en el registro', error);
          this.isLoading=false;
        this.authService.presentAlert('Error al crear cuenta','No pudimos crear tu cuenta en este momento. Asegúrate de que todos los campos estén correctamente llenados e intenta nuevamente. Si el problema persiste, contacta con nuestro soporte.','');
        }
      );
  }
}
