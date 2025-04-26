import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, catchError, EMPTY, tap } from 'rxjs';
import { Taller } from '../../interfaces/taller';
import { TallerService } from '../../core/services/taller.service';
import { Router } from '@angular/router';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';

@Component({
  selector: 'app-taller-list',
  standalone: true,
  imports: [AsyncPipe, ErrorMessageComponent],
  templateUrl: './taller-list.component.html',
  styleUrls: ['./taller-list.component.css']
})
export class TallerListComponent implements OnInit {
  public tallerList$!: Observable<Taller[]>;
  public errorMessage!: string;
  public taller$ = new BehaviorSubject<Taller | undefined>(undefined);
  showForm = false;

  constructor(private service: TallerService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.tallerList$ = this.service.getTallerList().pipe(
      tap((talleres) => console.log('Talleres:', talleres)),
      catchError((error: string) => {
        this.errorMessage = error;
        return EMPTY;
      })
    );
  }

  getTaller(id_taller: number): void {
    console.log('ID Taller:', id_taller);
    if (id_taller) {
      this.errorMessage = "";
      this.service.fetchAndStoreTaller(id_taller.toString());
      console.log('Enviando taller:', id_taller);
    } else {
      this.errorMessage = "No se ha encontrado el taller";
    }
  }

  addTaller(): void {
    this.service.clear();
    this.router.navigate(['/tallerForm']);
  }

  deleteTaller(id_taller: number): void {
    this.service.deleteTaller(id_taller).subscribe(
      () => {
        console.log('Taller eliminado');
        this.tallerList$ = this.service.getTallerList().pipe(
          catchError((error: string) => {
            this.errorMessage = error;
            return EMPTY;
          })
        );
      },
      (error) => {
        console.error('Error al eliminar el taller:', error);
      }
    );
  }
}
