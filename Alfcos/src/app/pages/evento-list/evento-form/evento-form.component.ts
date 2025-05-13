import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventoService } from '../../../core/services/evento.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Asiento } from '../../../interfaces/asiento';
import { ListaEspera } from '../../../interfaces/lista-espera';
import { catchError, EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder, private eventoServ: EventoService, private cdr: ChangeDetectorRef, private router: Router) {}

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

        this.listaEspera$ = this.eventoServ.getListaEspera(this.evento.id_evento).pipe(
          catchError((error: string) => {
            this.errorMessage = error;
            return EMPTY;
          })
        );
        this.listaEspera$.subscribe((asientos) => {
          console.log('Asientos recibidos en el componente:', asientos);
          console.log('Tipo de asientos:', Array.isArray(asientos) ? 'Arreglo' : typeof asientos);
        });
      }
    });
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
    return `${item.n_grupo}-${item.n_asiento}`; // Combina los dos atributos en un string único
  }

  vaciarAsiento(n_grupo: number, n_asiento: number): void {
    if (this.evento?.id_evento) {
      this.eventoServ.vaciarAsiento(this.evento.id_evento, n_grupo, n_asiento).subscribe(
        () => {
          console.log('Asiento vaciado correctamente.');
          this.asientos$ = this.eventoServ.getAsientos(this.evento.id_evento); // Refresh asientos
        },
        (error) => {
          console.error('Error al vaciar el asiento:', error);
        }
      );
    }
  }

  asignarAsiento(n_grupo: number, n_asiento: number): void {
    const socio = prompt('Ingrese el número de socio:');
    if (socio && this.evento?.id_evento) {
      console.log('Asiento:', socio);
      this.eventoServ.asignarAsiento(this.evento.id_evento, +socio, n_grupo, n_asiento).subscribe(
        () => {
          console.log('Asiento asignado correctamente.');
          this.asientos$ = this.eventoServ.getAsientos(this.evento.id_evento); // Refresh asientos
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
          this.listaEspera$ = this.eventoServ.getListaEspera(this.evento.id_evento); // Refresh lista de espera
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
          this.listaEspera$ = this.eventoServ.getListaEspera(this.evento.id_evento); // Refresh lista de espera
        },
        (error) => {
          console.error('Error al eliminar de la lista de espera:', error);
        }
      );
    }
  }
}
