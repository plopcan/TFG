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
        const dni = formGroup.get('dni')?.value
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        const rexDni = /^[0-9]{8}[A-Z]$/i;

          const numero = parseInt(dni.substring(0, 8), 10);
          const letra = dni.charAt(8).toUpperCase();
          const letraEsperada = letters[numero % 23];

        if(rexDni.test(dni) && letra === letraEsperada) {
            return {DocValid: true};
        }
        return null;
    }
  }
}
