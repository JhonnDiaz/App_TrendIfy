import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage implements OnInit {
  user: { id?: number, name?: string, phone?: string, email?: string, direccion?: string, contraseña?: string } | null = null;
  products: any[] = [];
  clienteId: string = '';
  headerTitle: string | undefined;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {

    this.authService.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.clienteId = user?.id?.toString() || ''; 
        console.log('Usuario:', this.user);

        
        if (this.clienteId) {
          this.fetchProducts();
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del usuario:', err);
      },
    });
  }
  fetchProducts() {
    const url = 'http://localhost:3000/compras'; 

    this.http.get<any[]>(url, { params: { cliente_id: this.clienteId } })
      .subscribe({
        next: (response) => {
          this.products = response.filter(
            (product) => product.Estado_Venta === 'Pendiente' || product.Estado_Venta === 'Finalizado'
          ); // Filtrar solo los estados requeridos
          console.log('Productos comprados:', this.products);
        },
        error: (err) => {
          console.error('Error al obtener productos:', err);
          console.log('Error', 'No se pudieron cargar las compras.');
        },
      });
  }

  // Maneja la cancelación de un pedido
  cancelOrder(product: number, ventaId: number) {
    this.showAlert(
      'Cancelar Pedido',
      `¿Estás seguro de cancelar el pedido con el Nombre: ${product}?`,
      [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: () => {
            const apiUrl = `http://localhost:3000/ventas/${ventaId}/cancelar`;
          
            this.http.patch(apiUrl, {}).subscribe(
              async (response) => {
                this.authService.presentAlert('Éxito', 'La venta ha sido cancelada con éxito.', '');

                this.products = this.products.filter((product) => product.id !== ventaId);
              },
              async (error) => {
                this.authService.presentAlert('Error', error.error?.message || 'No se pudo cancelar la venta. Intenta nuevamente.', '/user-info');
              }
            );

            console.log(`Pedido con ID ${product} cancelado.`);
          },
        },
      ]
    );
  }


  // Mostrar alertas
  async showAlert(header: string, message: string, buttons: any[] = ['OK']) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons,
    });
    await alert.present();
  }

  async logout() {
    try {
      await this.authService.removeUser();
      this.user = null;
      this.headerTitle = 'Inicio';
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }


  // Maneja la cancelación de un pedido
  EliminarCliente() {
    this.showAlert(
      '¿Estás seguro?',
      `Estás a punto de eliminar este usuario. Esta acción no se puede deshacer. ¿Deseas continuar?`,
      [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: () => {
            const apiUrl = `http://localhost:3000/clientes/${this.user?.id}/estado`; // Cambia a puerto 3001 si tu servidor usa ese puerto
  
        
            const body = { estado: false };
  
            // Llamar al endpoint
            this.http.patch(apiUrl, body).subscribe(
              async (response) => {
                this.authService.presentAlert(
                  'Éxito',
                  'La cuenta se eliminó con éxito.',
                  '/login' 
                );
              },
              async (error) => {
                this.authService.presentAlert(
                  'Error',
                  error.error?.message || 'No se pudo eliminar la cuenta. Intenta nuevamente.',
                  '/user-info' 
                );
              }
            );
            this.authService.removeUser();
          },
        },
      ]
    );
  }
  

}
