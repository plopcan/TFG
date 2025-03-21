import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../../interfaces/usuario';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
    usuario!: Usuario;
    success!: string;

  constructor(private http : HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
      const username = 'pilar';
      const password = 'admin';
      const auth = btoa(`${username}:${password}`);
      return new HttpHeaders({
        'Authorization': `Basic ${auth}`
      });
  }

  getUser(loginInfo: any): Observable<Usuario> {
    const { nombre, password } = loginInfo;
    const url = `${environment.urlDjango}/api/usuarios/buscar/?nombre=${nombre}&password=${password}`;
    console.log('Enviando solicitud a:', url);
    return this.http.get<Usuario>(url, { headers: this.getAuthHeaders() });
  }

    getRegistredUser(n_socio: string|null): Observable<Usuario> {
      const url = `${environment.urlDjango}/api/usuarios/buscarRegistrado/?n_socio=${n_socio}`;
      console.log('Enviando solicitud a:', url);
      return this.http.post<Usuario>(url, { headers: this.getAuthHeaders() });
    
    }

    getUserList(): Observable<Usuario[]>{
      const url = `${environment.urlDjango}/api/usuarios`;
      console.log('Enviando solicitud a:', url);
      return this.http.post<Usuario[]>(url, { headers: this.getAuthHeaders() });
    }


    updateUser(userInfo: any): Observable<string> {
      const url = `${environment.urlDjango}/api/usuarios`;
      console.log('Enviando solicitud a:', url);
      return this.http.put<string>(url, userInfo, { headers: this.getAuthHeaders() });
    }
    
    addUser(userInfo: any): string{
      this.http.post<string>(`${environment.urlFlask}usuario/addUser`, userInfo).subscribe(
        (response) => {
          this.success = response
        },
        (error) => {
          console.error('Error al crear el usuario:', error);
        });
        return this.success
    }
    
    deleteUser(id: string|null): string{
      this.http.post<string>(`${environment.urlFlask}usuario/deleteUser`, {'id': id}).subscribe(
        (response) => {
          this.success = response
        },
        (error) => {
          console.error('Error al recibir el usuario del servidor:', error);
        });
        return this.success
    }
}
