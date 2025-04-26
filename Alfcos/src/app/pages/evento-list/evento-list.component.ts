import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, Observable } from 'rxjs';
import { Evento } from '../../interfaces/evento';
import { EventoService } from '../../core/services/evento.service';
import { Router } from '@angular/router';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';

@Component({
  selector: 'app-evento-list',
  standalone: true,
    imports: [AsyncPipe, ErrorMessageComponent],
  templateUrl: './evento-list.component.html',
  styleUrl: './evento-list.component.css'
})
export class EventoListComponent {
public eventoList$!: Observable<Evento[]>;
  public errorMessage!: string;
  public socio$ = new BehaviorSubject<Evento | undefined>(undefined);
  showForm = false;

  constructor(private service: EventoService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.eventoList$ = this.service.getEventoList().pipe(
      catchError((error: string) => {
        this.errorMessage = error;
        return EMPTY;
      })
    );
  }

  getEvento(id_evento: number): void {
      if (id_evento) {
        this.errorMessage = "";
        this.service.fetchAndStoreEvento(id_evento);
        console.log('Enviando socio:', id_evento);
      } else {
        this.errorMessage = "No se ha encontrado el socio";
      }
  }

  addSocio() {
    this.service.clear();
    this.router.navigate(['/eventoForm']);
  }
  deleteEvento(id_evento: number) {
    this.service.deleteEvento(id_evento).subscribe(
      () => {
        console.log('Socio eliminado');
        this.eventoList$ = this.service.getEventoList().pipe(
          catchError((error: string) => {
            this.errorMessage = error;
            return EMPTY;
          })
        );
      },
      (error) => {
        console.error('Error al eliminar el socio:', error);
        this.errorMessage = "Error al eliminar el socio";
      }
    );
  }
}
