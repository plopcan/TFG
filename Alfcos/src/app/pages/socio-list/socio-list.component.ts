import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SocioService } from '../../core/services/socio.service';
import { catchError, EMPTY, Observable, BehaviorSubject } from 'rxjs';
import { Socio } from '../../interfaces/socio';
import { ErrorMessageComponent } from "../../components/error-message/error-message.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-socio-list',
  standalone: true,
  imports: [AsyncPipe, ErrorMessageComponent],
  templateUrl: './socio-list.component.html',
  styleUrl: './socio-list.component.css'
})
export class SocioListComponent implements OnInit {
  public socioList$!: Observable<Socio[]>;
  public errorMessage!: string;
  public socio$ = new BehaviorSubject<Socio | undefined>(undefined);
  showForm = false;

  constructor(private service: SocioService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.socioList$ = this.service.getSocioList().pipe(
      catchError((error: string) => {
        this.errorMessage = error;
        return EMPTY;
      })
    );
  }

  getSocio(n_socio: number): void {
      if (n_socio) {
        this.errorMessage = "";
        this.service.fetchAndStoreSocio(n_socio.toString());
        console.log('Enviando socio:', n_socio);
      } else {
        this.errorMessage = "No se ha encontrado el socio";
      }
  }

  addSocio() {
    this.service.clear();
    this.router.navigate(['/socioForm']);
  }
  deleteSocio(n_socio: number) {
    this.service.deleteSocio(n_socio).subscribe(
      () => {
        console.log('Socio eliminado');
        this.socioList$ = this.service.getSocioList().pipe(
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
