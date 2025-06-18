import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SocioService } from '../../core/services/socio.service';
import { catchError, EMPTY, Observable, BehaviorSubject } from 'rxjs';
import { Socio } from '../../interfaces/socio';
import { ErrorMessageComponent } from "../../components/error-message/error-message.component";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-socio-list',
  standalone: true,
  imports: [AsyncPipe, ErrorMessageComponent, FormsModule],
  templateUrl: './socio-list.component.html',
  styleUrl: './socio-list.component.css'
})
export class SocioListComponent implements OnInit {
  public socioList$!: Observable<any>;
  public errorMessage!: string;
  public socio$ = new BehaviorSubject<Socio | undefined>(undefined);
  showForm = false;

  // Pagination properties
  currentPage = 1;
  hasNextPage = true;

  // Filtro properties
  filterNombre: string = '';
  filterApellido: string = '';
  filterDni: string = '';
  filterPagado: string = '';
  filterNSocio: string = '';

  constructor(private service: SocioService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  loadPage(page: number): void {
    if (this.hasActiveFilters()) {
      this.socioList$ = this.service.filterSocios(this.getFilterData(), page).pipe(
        catchError((error: string) => {
          this.errorMessage = error;
          return EMPTY;
        })
      );
      this.socioList$.subscribe(response => {
        this.hasNextPage = !!response?.next;
      });
      return;
    }
    this.socioList$ = this.service.getSocioListPaginated(page).pipe(
      catchError((error: string) => {
        this.errorMessage = error;
        return EMPTY;
      })
    );
    this.socioList$.subscribe(response => {
      this.hasNextPage = !!response?.next;
    });
  }

  getFilterData(): any {
    const filterData: any = {};
    if (this.filterNombre) filterData.nombre = this.filterNombre;
    if (this.filterApellido) filterData.apellidos = this.filterApellido;
    if (this.filterDni) filterData.dni = this.filterDni;
    if (this.filterPagado) filterData.pagado = this.filterPagado;
    if (this.filterNSocio) filterData.n_socio = this.filterNSocio;
    return filterData;
  }

  hasActiveFilters(): boolean {
    return !!(this.filterNombre || this.filterApellido || this.filterDni || this.filterPagado || this.filterNSocio);
  }

  filterSocios(page: number = 1): void {
    this.socioList$ = this.service.filterSocios(this.getFilterData(), page).pipe(
      catchError((error: string) => {
        this.errorMessage = error;
        return EMPTY;
      })
    );
    this.socioList$.subscribe(response => {
      this.hasNextPage = !!response?.next;
    });
  }

  onFilterSubmit(): void {
    this.currentPage = 1;
    this.filterSocios(this.currentPage);
  }

  clearFilters(): void {
    this.filterNombre = '';
    this.filterApellido = '';
    this.filterDni = '';
    this.filterPagado = '';
    this.filterNSocio = '';
    this.currentPage = 1;
    this.loadPage(this.currentPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPage(this.currentPage);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadPage(this.currentPage);
    }
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
        this.loadPage(this.currentPage);
      },
      (error) => {
        console.error('Error al eliminar el socio:', error);
        this.errorMessage = "Error al eliminar el socio";
      }
    );
  }

  createCuota(n_socio: number): void {
        this.router.navigate(['/cuentaForm'], 
          {queryParams: { n_socio: n_socio, tipo: 'Cuota' }});
  }
}
