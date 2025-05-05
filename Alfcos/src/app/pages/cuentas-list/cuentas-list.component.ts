import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CuentasService } from '../../core/services/cuentas.service';
import { catchError, EMPTY, Observable, BehaviorSubject, map, tap } from 'rxjs';
import { Cuentas } from '../../interfaces/cuentas';
import { ErrorMessageComponent } from "../../components/error-message/error-message.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuentas-list',
  standalone: true,
  imports: [AsyncPipe, ErrorMessageComponent],
  templateUrl: './cuentas-list.component.html',
  styleUrl: './cuentas-list.component.css'
})
export class CuentasListComponent implements OnInit {
  public cuentasList$!: Observable<any>;
  public errorMessage!: string;
  public cuenta$ = new BehaviorSubject<Cuentas | undefined>(undefined);
  showForm = false;

  // Pagination properties
  currentPage = 1;
  hasNextPage = true;

  constructor(private service: CuentasService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  loadPage(page: number): void {
    this.cuentasList$ = this.service.getCuentasList(page).pipe(
      tap(response => console.log('Respuesta del API:', response))
    );
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

  getCuenta(id_cuenta: number, tipo:string): void {
    if (id_cuenta) {
      this.errorMessage = "";
      this.service.fetchAndStoreCuenta(id_cuenta.toString(), tipo);
      console.log('Enviando cuenta:', id_cuenta);
    } else {
      this.errorMessage = "No se ha encontrado la cuenta";
    }
  }

  addCuenta() {
    this.service.clear();
    this.router.navigate(['/cuentaForm']);
  }

  deleteCuenta(id_cuenta: number) {
    this.service.deleteCuentas(id_cuenta).subscribe(
      () => {
        console.log('Cuenta eliminada');
        this.loadPage(this.currentPage);
      },
      (error) => {
        console.error('Error al eliminar la cuenta:', error);
        this.errorMessage = "Error al eliminar la cuenta";
      }
    );
  }

  anularCuenta(id_cuenta: number): void {
    this.service.anularCuenta(id_cuenta).subscribe(
      () => {
        console.log('Cuenta anulada');
        this.loadPage(this.currentPage);
      },
      (error) => {
        console.error('Error al anular la cuenta:', error);
        this.errorMessage = "Error al anular la cuenta";
      }
    );
  }

  descargar() {
    this.service.descargarCuentas().subscribe(
      (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cuentas.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error al descargar el PDF:', error);
      }
    );
  }
}
