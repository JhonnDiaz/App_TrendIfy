import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000'; 
  authService: any;
   private userSubject = new BehaviorSubject<any | null>(null); 
  private tokenKey = 'authToken';
  private _storage: Storage | null = null;
  myVariable: string = '' ; 




  constructor(private http: HttpClient, private storage: Storage,private alertController: AlertController,private router: Router) {
    this.init();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }
  
  async presentAlert( header: string,mensaje: string, red: string) {
    this.myVariable = red;
  
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            if (this.myVariable.trim()) {
            
              this.router.navigate([this.myVariable]); 
            } else {
              console.log('La variable está vacía. No se realiza la redirección.');
              
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  // -------------registro y login-----------------//
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}/login`, body);
  }

  register(email: string, password: string, nombre: string, direccion: string, telefono: string): Observable<any> {
    const body = { email, password, nombre, direccion, telefono }; // Agregar direccion y telefono
    return this.http.post<any>(`${this.apiUrl}/register`, body); // Enviar todos los datos al backend
  }


//---------inicio y cierre de session--------------//

  // Inicializa el almacenamiento
  async init() {
    const storage = await this.storage.create();
    this.storage = storage;
  }

  // Guarda la información del usuario
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user); 
    console.log('setUser',user);
  }


  // Recupera la información del usuario
  getUser(): Observable<any> {
    return this.userSubject.asObservable(); 
  }
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeUser(): void {
    localStorage.removeItem('user');
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null); 
  }
  async isAuthenticated(): Promise<boolean> {
    const user = await this.authService.getUser();
    return !!user; 
  }
  


}