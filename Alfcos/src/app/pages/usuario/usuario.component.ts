import { Component} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../interfaces/usuario';
import { Router } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { CommonModule, NgFor } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Validation } from '../../utils/validation';
import { SocioService } from '../../core/services/socio.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [AsyncPipe, ErrorMessageComponent, NgFor, CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})

export class UsuarioComponent {
  rol!: string | null
  user!: Usuario
  errorMessage!: string
  
  UserForm: FormGroup

  constructor(private auth: AuthService, private router: Router, private Uservice: UsuarioService, private fb: FormBuilder
    , private Socioserv: SocioService
  ){
    this.UserForm = this.fb.group({
      user: ['', Validators.required],
      password: ['', Validators.required],
      new_psw: ['', Validators.required],
      new_psw_confirm: ['', Validators.required],
    n_socio: ['', Validators.required],
    rol: ['', Validators.required],
    id: ['', Validators.required],
    },
  {
    validators: [Validation.match('new_psw', 'new_psw_confirm')]
  });
  }
    ngOnInit(): void{
      if(this.auth.isLoggedIn){
        this.rol = sessionStorage.getItem("rol");
        if(this.rol != null){
          if(this.rol == "admin"){
            this.Uservice.getRegistredUser(sessionStorage.getItem("user")).subscribe(user => {
              this.user = user;
              this.UserForm.patchValue({
                user: this.user != null? this.user.nombre : '',
                n_socio: this.user != null? this.user.n_socio : '',
                rol: this.user != null? this.user.rol : '',
              });
            });
          }

        }
      }else{
        this.router.navigate(['/']);
      }
    }

    isloged(){
      return this.auth.isLoggedIn;
    }

    updateUser(){
      this.UserForm.updateValueAndValidity()
      let info = this.UserForm.value;
      console.log(info);
      let success = this.Uservice.updateUser(info)
      console.log(success);
        this.errorMessage = "";
        if(this.rol == "admin"){
          this.Uservice.getRegistredUser(sessionStorage.getItem("user")).subscribe(user => {
            this.user = user;
            this.UserForm.patchValue({
              user: this.user != null? this.user.nombre : '',
              n_socio: this.user != null? this.user.n_socio : '',
              rol: this.user != null? this.user.rol : '',
            });
          });
      }else{
        this.errorMessage = "error al actualizar el usuario";
      }
    }


  get f(): { [key: string]: AbstractControl } {
    return this.UserForm.controls;
  }

}
