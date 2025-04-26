import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CuentasService } from '../../../core/services/cuentas.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuentas-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cuentas-form.component.html',
  styleUrl: './cuentas-form.component.css'
})
export class CuentasFormComponent {
  cuentasForm: FormGroup;

  constructor(private fb: FormBuilder, private cuentasService: CuentasService, private router: Router) {
    this.cuentasForm = this.fb.group({
      descripcion: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      tipo_id: ['', Validators.required],
      n_socio: [''], // Optional, shown conditionally
      id_evento: [''] // Optional, shown conditionally
    });
  }

  onSubmit(): void {
    if (this.cuentasForm.valid) {
      const formValue = { ...this.cuentasForm.value };

      // Remove unused fields based on the selected type
      if (formValue.tipo_id != '2') {
        delete formValue.n_socio;
      }
      if (formValue.tipo != '1') {
        delete formValue.id_evento;
      }

      this.cuentasService.addCuentas(formValue).subscribe({
        next: (response) => {
          console.log('Cuenta creada exitosamente:', response);
          this.router.navigate(['/cuentas']); // Navigate to /cuentas
        },
        error: (error) => {
          console.error('Error al crear la cuenta:', error);
        }
      });
    }
  }
}
