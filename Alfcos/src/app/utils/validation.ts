import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export class Validation { 
    static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }

      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }

  static validateDocument(): ValidatorFn{
    return (formGroup:AbstractControl): ValidationErrors|null => {
        const tipo = formGroup.get('tipoDocumento')?.value
        const dni = formGroup.get('dni')?.value

        const rexDni = /^[0-9]{8}[A-Z]$/i;
        const rexNie = /^[XYZ][0-9]{7}[A-Z]$/i;

        if(tipo === 'dni' && rexDni.test(dni)){
            return {DocValid: true};
        }
        if(tipo === 'nie' && rexNie.test(dni)){
            return {DocValid: true};
        }
        return null;
    }
  }
}
