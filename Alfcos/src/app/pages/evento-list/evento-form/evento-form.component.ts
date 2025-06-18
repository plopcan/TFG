import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventoService } from '../../../core/services/evento.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Asiento } from '../../../interfaces/asiento';
import { ListaEspera } from '../../../interfaces/lista-espera';
import { catchError, EMPTY, Observable } from 'rxjs';
import { CuentasService } from '../../../core/services/cuentas.service';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './evento-form.component.html',
  styleUrls: ['./evento-form.component.css']
})
export class EventoFormComponent implements OnInit {
  evento: any | undefined;
  public eF!: FormGroup;
  public listaF!: FormGroup;
  errorMessage!: string;
  asientos$: Observable<any> | undefined;
  listaEspera$: Observable<any> | undefined;
  n_socio!: number;
  asientosPorGrupo: { [grupo: number]: any[] } = {};
  paginacionGrupos: { [grupo: number]: { pagina: number, pageSize: number } } = {}; // Estado de paginación por grupo
  Math = Math; // Exponer Math para la plantilla

  // Paginación lista de espera
  listaEsperaCompleta: any[] = [];
  listaEsperaPagina: any[] = [];
  paginaListaEspera = 1;
  pageSizeListaEspera = 5;

  // Solo se necesita el input para cada asiento
  asignarSocioInput: { [key: string]: string } = {};

  constructor(private fb: FormBuilder, private eventoServ: EventoService, private cdr: ChangeDetectorRef, private router: Router, private cuentaServ: CuentasService) {}

  ngOnInit(): void {
    this.eventoServ.evento$.subscribe((evento) => {
      this.evento = evento;
      console.log('Evento:', this.evento);

      this.eF = this.fb.group({
        nombre: [this.evento?.nombre || '', Validators.required],
        precio: [this.evento?.precio || '', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.00)]],
        fecha_ini: [this.evento?.fecha_ini || '', Validators.required],
        fecha_fin: [this.evento?.fecha_fin || '', Validators.required],
        tipo_id: [this.evento?.tipo_id || '', Validators.required],
        n_asientos: [this.evento?.n_asientos || '', [Validators.required, Validators.min(0)]],
        num_grupos: [this.evento?.num_grupos || '', [Validators.required, Validators.min(0)]],
        descripcion: [this.evento?.descripcion || '', Validators.required]
      });

      this.listaF = this.fb.group({
        n_socio: [this.n_socio || '', [Validators.required]]
      });

      this.cdr.markForCheck();

      if (this.evento?.id_evento) {
        // Asignar el observable directamente
        this.asientos$ = this.eventoServ.getAsientos(this.evento.id_evento).pipe(
          catchError((error) => {
            console.error('Error al obtener los asientos:', error);
            this.errorMessage = 'Error al cargar los asientos.';
            return []; // Devuelve un arreglo vacío en caso de error
          })
        );

        // Agrupar asientos por grupo al recibirlos
        this.asientos$.subscribe((asientos) => {
          this.asientosPorGrupo = {};
          this.paginacionGrupos = {};
          asientos.forEach((asiento: any) => {
            if (!this.asientosPorGrupo[asiento.n_grupo]) {
              this.asientosPorGrupo[asiento.n_grupo] = [];
              this.paginacionGrupos[asiento.n_grupo] = { pagina: 1, pageSize: 5 }; // pageSize por defecto
            }
            this.asientosPorGrupo[asiento.n_grupo].push(asiento);
          });
          this.cdr.markForCheck();
        });

        this.listaEspera$ = this.eventoServ.getListaEspera(this.evento.id_evento).pipe(
          catchError((error: string) => {
            this.errorMessage = error;
            return EMPTY;
          })
        );
        this.listaEspera$.subscribe((asientos) => {
          this.listaEsperaCompleta = asientos;
          this.paginaListaEspera = 1;
          this.actualizarListaEsperaPagina();
        });
      }
    });
  }

  actualizarListaEsperaPagina() {
    const start = (this.paginaListaEspera - 1) * this.pageSizeListaEspera;
    this.listaEsperaPagina = this.listaEsperaCompleta.slice(start, start + this.pageSizeListaEspera);
  }

  cambiarPaginaListaEspera(incremento: number) {
    const total = this.listaEsperaCompleta.length;
    const maxPagina = Math.max(1, Math.ceil(total / this.pageSizeListaEspera));
    let nuevaPagina = this.paginaListaEspera + incremento;
    if (nuevaPagina < 1) nuevaPagina = 1;
    if (nuevaPagina > maxPagina) nuevaPagina = maxPagina;
    this.paginaListaEspera = nuevaPagina;
    this.actualizarListaEsperaPagina();
  }

  // Devuelve los asientos paginados para un grupo
  getAsientosPaginados(grupo: number | string): any[] {
    grupo = typeof grupo === 'string' ? parseInt(grupo, 10) : grupo;
    const pageSize = this.paginacionGrupos[grupo]?.pageSize || 5;
    const pagina = this.paginacionGrupos[grupo]?.pagina || 1;
    const asientos = this.asientosPorGrupo[grupo] || [];
    const start = (pagina - 1) * pageSize;
    return asientos.slice(start, start + pageSize);
  }

  // Cambia de página para un grupo
  cambiarPagina(grupo: number | string, incremento: number) {
    grupo = typeof grupo === 'string' ? parseInt(grupo, 10) : grupo;
    const paginacion = this.paginacionGrupos[grupo];
    if (!paginacion) return;
    const total = this.asientosPorGrupo[grupo]?.length || 0;
    const maxPagina = Math.ceil(total / paginacion.pageSize);
    let nuevaPagina = paginacion.pagina + incremento;
    if (nuevaPagina < 1) nuevaPagina = 1;
    if (nuevaPagina > maxPagina) nuevaPagina = maxPagina;
    this.paginacionGrupos[grupo].pagina = nuevaPagina;
  }

  sendData() {
    if (this.evento) {
      this.updateEvento();
    } else {
      this.addEvento();
    }
  }

  updateEvento() {
    this.eF.updateValueAndValidity();
    let info = this.eF.value;
    this.eventoServ.updateEvento(info, this.evento?.id_evento).subscribe(
      (response) => {
        this.router.navigate(['/eventos']);
      },
      (error) => {
        this.errorMessage = "Error al actualizar el evento";
      }
    );
  }

  addEvento() {
    this.eF.updateValueAndValidity();
    let info = this.eF.value;
    console.log('Enviando evento:', info);
    this.eventoServ.addEvento(info).subscribe(
      (response) => {
        this.router.navigate(['/eventos']);
      },
      (error) => {
        this.errorMessage = "Error al añadir el evento";
      }
    );
  }

  trackByAttributes(index: number, item: any): string {
    return `${item.n_grupo}-${item.n_asiento}`;
  }

  trackBySocio(index: number, item: any): number {
    return item.n_socio;
  }

  vaciarAsiento(n_grupo: number, n_asiento: number): void {
    if (this.evento?.id_evento) {
      this.eventoServ.vaciarAsiento(this.evento.id_evento, n_grupo, n_asiento).subscribe(
        () => {
          console.log('Asiento vaciado correctamente.');
          // Refrescar y reagrupar asientos
          this.asientos$ = this.eventoServ.getAsientos(this.evento.id_evento);
          this.asientos$.subscribe((asientos) => {
            this.asientosPorGrupo = {};
            asientos.forEach((asiento: any) => {
              if (!this.asientosPorGrupo[asiento.n_grupo]) {
                this.asientosPorGrupo[asiento.n_grupo] = [];
              }
              this.asientosPorGrupo[asiento.n_grupo].push(asiento);
            });
            this.cdr.markForCheck();
          });
        },
        (error) => {
          console.error('Error al vaciar el asiento:', error);
        }
      );
    }
  }

  // Asignar asiento usando el valor del campo
  asignarAsientoForm(n_grupo: number, n_asiento: number) {
    const key = `${n_grupo}-${n_asiento}`;
    const socio = this.asignarSocioInput[key];
    const info = {'descripcion': 'Reserva de asiento ' + key,'tipo_id': 3, 'cantida': this.evento?.precio, 'subtipo': 'entrada'};
    if (socio && this.evento?.id_evento) {
      this.cuentaServ.addCuentas(info);
      this.eventoServ.asignarAsiento(this.evento.id_evento, +socio, n_grupo, n_asiento).subscribe(
        () => {
          this.asignarSocioInput[key] = '';
          // Refrescar y reagrupar asientos
          this.asientos$ = this.eventoServ.getAsientos(this.evento.id_evento);
          this.asientos$.subscribe((asientos) => {
            this.asientosPorGrupo = {};
            asientos.forEach((asiento: any) => {
              if (!this.asientosPorGrupo[asiento.n_grupo]) {
                this.asientosPorGrupo[asiento.n_grupo] = [];
              }
              this.asientosPorGrupo[asiento.n_grupo].push(asiento);
            });
            this.cdr.markForCheck();
          });
        },
        (error) => {
          console.error('Error al asignar el asiento:', error);
        }
      );
    }
  }

  agregarListaEspera(): void {
    this.n_socio = this.listaF.value.n_socio;
    if (this.evento?.id_evento && this.n_socio) {
      this.eventoServ.agregarLista(this.evento.id_evento, this.n_socio).subscribe(
        () => {
          console.log('Socio agregado a la lista de espera.');
          this.listaEspera$ = this.eventoServ.getListaEspera(this.evento.id_evento);
          this.listaEspera$.subscribe((asientos) => {
            this.listaEsperaCompleta = asientos;
            this.paginaListaEspera = 1;
            this.actualizarListaEsperaPagina();
          });
        },
        (error) => {
          console.error('Error al agregar a la lista de espera:', error);
        }
      );
    }
  }

  eliminarDeListaEspera(socio: number): void {
    if (this.evento?.id_evento) {
      this.eventoServ.eliminarLista(this.evento.id_evento, socio).subscribe(
        () => {
          console.log('Socio eliminado de la lista de espera.');
          this.listaEspera$ = this.eventoServ.getListaEspera(this.evento.id_evento);
          this.listaEspera$.subscribe((asientos) => {
            this.listaEsperaCompleta = asientos;
            // Si la página actual queda vacía, retrocede una página si es posible
            const maxPagina = Math.max(1, Math.ceil(this.listaEsperaCompleta.length / this.pageSizeListaEspera));
            if (this.paginaListaEspera > maxPagina) {
              this.paginaListaEspera = maxPagina;
            }
            this.actualizarListaEsperaPagina();
          });
        },
        (error) => {
          console.error('Error al eliminar de la lista de espera:', error);
        }
      );
    }
  }
}
