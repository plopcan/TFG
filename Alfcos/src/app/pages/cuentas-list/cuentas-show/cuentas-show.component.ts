import { Component, OnInit } from '@angular/core';
import { CuentasService } from '../../../core/services/cuentas.service';
import { Cuentas } from '../../../interfaces/cuentas';
import { Cuota } from '../../../interfaces/cuota';
import { CuentaEvento } from '../../../interfaces/cuenta_evento';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cuentas-show',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuentas-show.component.html',
  styleUrls: ['./cuentas-show.component.css']
})
export class CuentasShowComponent implements OnInit {
  cuenta: Cuentas | null = null;
  cuota: Cuota | null = null;
  cuentaEvento: CuentaEvento | null = null;

  constructor(private cuentasService: CuentasService) {}

  ngOnInit(): void {
    this.cuentasService.cuentas$.subscribe((cuenta) => {
      if (cuenta) {
        if ('tipo' in cuenta && !('n_socio' in cuenta) && !('eventoId' in cuenta)) {
          this.cuenta = cuenta as Cuentas;
          this.cuota = null;
          this.cuentaEvento = null;
        } else if ('n_socio' in cuenta) {
          console.log('cuota:' + cuenta.n_socio);
          this.cuota = cuenta as Cuota;
          this.cuenta = null;
          this.cuentaEvento = null;
        } else if ('eventoId' in cuenta) {
          console.log('evento:' + cuenta);
          this.cuentaEvento = cuenta as CuentaEvento;
          this.cuenta = null;
          this.cuota = null;
        }
      }
    });
  }
}
