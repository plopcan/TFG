import { Component} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../interfaces/usuario';
import { Router } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { Socio } from '../../interfaces/socio';
import { CommonModule, NgFor } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Validation } from '../../utils/validation';
import { SocioService } from '../../core/services/socio.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [AsyncPipe, ErrorMessageComponent, NgFor, CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})

export class UserListComponent {
  rol!: string | null
  user!: Usuario | undefined
  userList$!: Observable<Usuario[]>
  socioList$: Socio[] = []
  errorMessage!: string
  submitted = false;
  
  oldUserForm: FormGroup
  newUserForm: FormGroup

  constructor(private auth: AuthService, private router: Router, private Uservice: UsuarioService, private fb: FormBuilder
    , private Socioserv: SocioService
  ){
    this.oldUserForm = this.fb.group({
      user: ['', Validators.required],
      new_psw: ['', Validators.required],
      new_psw_confirm: ['', Validators.required],
    n_socio: ['', Validators.required],
    rol: ['', Validators.required],
    id: ['', Validators.required],
    tipoDocumento: ['dni', Validators.required]
    },
  {
    validators: [Validation.match('new_psw', 'new_psw_confirm')],
    valDoc: [Validation.validateDocument()]
  });
  this.newUserForm = this.fb.group({
    user: ['', Validators.required],
    new_psw: ['', Validators.required],
    new_psw_confirm: ['', Validators.required],
  n_socio: ['', Validators.required],
  rol: ['', Validators.required],
  tipoDocumento: ['dni', Validators.required]
  },
{
  validators: [Validation.match('new_psw', 'new_psw_confirm')],
  valDoc: [Validation.validateDocument()]
});
  }
    ngOnInit(): void{
      if(this.auth.isLoggedIn){
        this.rol = sessionStorage.getItem("rol");
        if(this.rol != null){
          if(this.rol == "admin"){
            this.userList$ = this.Uservice.getUserList().pipe(catchError((error:string)=>{
              this.errorMessage = error;
      
              return EMPTY;
            })) ;
          }else{
            this.Uservice.getRegistredUser(sessionStorage.getItem("user")).subscribe(user => {
              this.user = user;
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

    setSocio(dni:string, formName:String, event:Event){
      event?.preventDefault();
      if(formName == 'oldForm'){
        this.oldUserForm.get('dni')?.setValue(dni);
      }else{
        this.newUserForm.get('dni')?.setValue(dni);
      }
      
    }

   /* searchSocio(event : any){
      this.Socioserv.getSocio(event.target.value).subscribe(data => {this.socioList$ = data;});
    }*/

    getUser(user:string): void{
      /*this.user = this.Uservice.getRegistredUser(user);*/
      this.userList$.subscribe((usuarios:Usuario[])=>{
        this.user = usuarios.find(usuario => usuario.nombre === user);
      })
      this.oldUserForm.patchValue({
        nombre: this.user != null? this.user.nombre : '',
        n_socio: this.user != null? this.user.n_socio : '',
        rol: this.user != null? this.user.rol : ''
      })
    }

    updateUser(){
      this.oldUserForm.updateValueAndValidity()
      this.submitted = true;
      let info = this.oldUserForm.value;
      console.log(info);
      let success = this.Uservice.updateUser(info)
      console.log(success);
        this.errorMessage = "";
        if(this.rol == 'admin'){
          this.userList$ = this.Uservice.getUserList().pipe(catchError((error:string)=>{
            this.errorMessage = error;
    
            return EMPTY;
          })) ;
        }else{
          this.Uservice.getRegistredUser(sessionStorage.getItem("user")).subscribe(user => {
            this.user = user;
          });
        }
    }

    addUser(){
      this.submitted = true;
      let info = this.newUserForm.value;
      console.log(info);
      let success = this.Uservice.addUser(info)
      console.log(success);
      if(success == 'success'){
        this.errorMessage = "";
        this.userList$ = this.Uservice.getUserList().pipe(catchError((error:string)=>{
          this.errorMessage = error;
  
          return EMPTY;
        })) ;
      }else{
        this.errorMessage = "error al añadir el usuario";
      }
    }

    onReset(): void {
      this.submitted = false;
      this.oldUserForm.reset();
    }

  get f(): { [key: string]: AbstractControl } {
    return this.oldUserForm.controls;
  }

  delete(id:string){
    this.submitted = true;
    let success = this.Uservice.deleteUser(id)
    console.log(success);
    if(success == 'success'){
      this.errorMessage = "";
      this.userList$ = this.Uservice.getUserList().pipe(catchError((error:string)=>{
        this.errorMessage = error;

        return EMPTY;
      })) ;
    }else{
      this.errorMessage = "error al añadir el usuario";
    }
  }
}
