import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Socio } from '../../../interfaces/socio';
import {  AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocioService } from '../../../core/services/socio.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-socio-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './socio-form.component.html',
  styleUrls: ['./socio-form.component.css']
})
export class SocioFormComponent implements OnInit {
  socio: Socio | undefined;
  public sF!: FormGroup;
  errorMessage!: string;
   imgLink!: string;

  constructor(private fb: FormBuilder, private socioServ: SocioService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.socioServ.socio$.subscribe((socio) => {
      this.socio = socio;
      console.log('Socio:', this.socio);

      this.sF = this.fb.group({
        nombre: [this.socio?.nombre || '', Validators.required],
        apellidos: [this.socio?.apellidos || '', Validators.required],
        sexo: [this.socio?.sexo || true, Validators.required],
        dni: [this.socio?.dni || '', Validators.required],
        tipoDocumento: ['dni', Validators.required],
        n_socio: [this.socio?.n_socio || '', Validators.required],
        direccion: [this.socio?.direccion || '', Validators.required],
        c_postal: [this.socio?.c_postal || '', Validators.required],
        tlf: [this.socio?.telefono || '', Validators.required],
        nacimiento: [this.socio?.fecha_nacimiento || '', Validators.required]
      });

      this.cdr.markForCheck();
    });
  }

  sendData() {
    this.updateSocio();
  }

  updateSocio() {
    this.sF.updateValueAndValidity();
    let info = this.sF.value;
    let success = this.socioServ.updateSocio(info);
    if (success) {
      // Manejar el éxito de la actualización
    } else {
      this.errorMessage = "Error al actualizar el socio";
    }
  }
}
