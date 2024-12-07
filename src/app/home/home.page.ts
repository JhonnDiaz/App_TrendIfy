import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, IonicModule, IonModal } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  productos: any[] = [];
  Metodos_pago: any[] = [];
  todosLosProductos: any[] = [];
  isModalOpen = false;
  selectedProductId: any[] = [];
  user: any = null;
  cantidad: number = 0;
  precio: number = 0;
  subtotal: number = 0;
  Iva: number = 0;




  constructor(private alertController: AlertController, private http: HttpClient, private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    this.authService.getUser().subscribe((user) => {
      this.user = user;
    });
    this.obtenerProductos();
    this.Metodos_pagos();
  }

  // Método para cargar el usuario de la sesión
  async cargarUsuario() {
    this.user = await this.authService.getUser(); // Obtiene el usuario almacenado
    console.log('Usuario autenticado:', this.user);
  }

  // Método para obtener los productos
  obtenerProductos() {
    this.http.get<any[]>('http://localhost:3000/productos').subscribe(
      (data) => {
        this.productos = data;
        this.todosLosProductos = data;

      },
      (error) => {
        console.error('Error al obtener productos:', error);
      }
    );
  }

  Metodos_pagos() {
    this.http.get<any[]>('http://localhost:3000/metodo_pago').subscribe(
      (data) => {
        this.Metodos_pago = data
        console.log(this.Metodos_pago);

      },
      (error) => {
        console.error('Error al obtener métodos pagos:', error);
      }
    );
  }

  buscarProductos(event: any) {
    const texto = event.target.value.toLowerCase();
    this.productos = this.todosLosProductos.filter((producto) =>
      producto.Nombre.toLowerCase().includes(texto)
    );
  }

  filtrarPorTipo(event: any) {
    const tipo = event.detail.value.toLowerCase();
    console.log('Tipo seleccionado:', tipo);
    console.log('Productos antes del filtro:', this.todosLosProductos);
    if (tipo === 'todos') {
      this.productos = [...this.todosLosProductos];
    } else {
      this.productos = this.todosLosProductos.filter(
        (producto) => producto.tipo.toLowerCase() === tipo
      );
    }
    console.log('Productos filtrados:', this.productos);
  }
  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.cantidad=0;
    this.subtotal=0;
  }


  actualizarPrecio() {
    if (this.selectedProductId) {
      this.precio = this.selectedProductId[4];
      this.calcularSubtotal();
    }
  }
  onWillDismiss() {
    this.isModalOpen = false;
  }
  calcularSubtotal() {
    if (!this.cantidad || this.cantidad <= 0) {
      this.subtotal = 0; 
      return;
    }
    this.subtotal = +((this.Iva + (this.cantidad * this.precio))).toFixed(2); 
  }
  registrarVenta() {
    const fechaActual = new Date();
    const fechaString = fechaActual.toISOString(); 
  
    if (!this.selectedProductId) {
      this.authService.presentAlert('Selecciona un Método de pago','Error en el método de pago','');
      return;
    }
  
    // Asegúrate de capturar correctamente el método de pago del ion-select
    const metodoPagoSeleccionado = (document.querySelector('ion-select') as HTMLIonSelectElement).value;
    if (!metodoPagoSeleccionado) {
      alert('Por favor selecciona un método de pago.');
      return;
    }
  
    const venta = {
      cliente_id: this.user ? this.user.id : null,
      productos: [
        {
          producto_id: this.selectedProductId[0],
          cantidad: this.cantidad,
        },
      ],
      metodo_pago_id: metodoPagoSeleccionado,
      subtotal: this.subtotal.toFixed(2),
      descuento: 0, // Cambia esto si manejas descuentos
      iva: this.Iva.toFixed(2),
      total: (this.subtotal).toFixed(2),
      fecha: fechaString,
    };
  
    console.log('Venta a registrar:', venta);
  
    this.http.post('http://localhost:3000/venta', venta).subscribe(
      (response: any) => {
        console.log('Registro exitoso', response);
        this.authService.presentAlert("Compra exitosa",'Gracias por tu compra','');
        this.cancel(); 
      },
      (error) => {
        console.error('Error en la compra', error);
        alert('Hubo un problema al registrar la venta.');
      }
    );
  }

  openModal(productId: number, Nombre: string, img: string, descripcion: string, precio: number) {
    this.selectedProductId = [productId, Nombre, img, descripcion, precio];
    console.log(this.selectedProductId);
    this.precio = precio;
    this.Iva = +(precio * 0.19).toFixed(2); 
    this.isModalOpen = true;
    this.isModalOpen = true;
  }



  // Restringir acciones (como comprar) a usuarios autenticados
  comprar(productId: number) {
    if (!this.user) {
      alert('Debes iniciar sesión para comprar este producto.');
      return;
    }
    console.log(`Producto con ID ${productId} comprado por el usuario ${this.user.name}`);
    // Lógica para procesar la compra
  }

  onSubmit() { }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¡Atención!',
      message: 'Por favor inicia sesión para continuar con la comprar.',
      buttons: [
        {
          text: 'Seguir explorando',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Iniciar Session',
          role: 'confirm',
          handler: () => {
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
  }
}
