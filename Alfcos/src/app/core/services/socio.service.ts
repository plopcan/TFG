import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socio } from '../../interfaces/socio';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SocioService {
  private socioSubject = new BehaviorSubject<Socio | undefined>(undefined);
  socio$ = this.socioSubject.asObservable();
  success!: string;

  constructor(private http: HttpClient, private router: Router) { }

  private getAuthHeaders(): HttpHeaders {
    const username = 'pilar';
    const password = 'admin';
    const auth = btoa(`${username}:${password}`);
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`
    });
  }

  getSocioList(): Observable<Socio[]> {
    const url = `${environment.urlDjango}/api/socios/`;
    console.log('Enviando solicitud a:', url);
    return this.http.get<Socio[]>(url, { headers: this.getAuthHeaders() });
  }

  getSocio(n_socio: string | null): Observable<Socio> {
    const url = `${environment.urlDjango}/api/socios/filtrar/?n_socio=${n_socio}`;
    console.log('Enviando solicitud a:', url);
    return this.http.get<Socio[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map(socios => socios[0])  // Tomar el primer elemento del array
    );
  }

  fetchAndStoreSocio(n_socio: string | null): void {
    this.getSocio(n_socio).subscribe(
      (socio) => {
        this.socioSubject.next(socio);
        console.log('Socio fetched and stored:', socio);
        this.router.navigate(['/socioForm']);  // Navegar después de almacenar el socio
      },
      (error) => {
        console.error('Error fetching socio:', error);
      }
    );
  }

  updateSocio(socioInfo: any): string {
    this.http.post<string>(`${environment.urlFlask}socio/updateSocio`, socioInfo).subscribe(
      (response) => {
        this.success = response;
      },
      (error) => {
        console.error('Error al actualizar el socio:', error);
      });
    return this.success;
  }

  addSocio(socioInfo: any): string {
    this.http.post<string>(`${environment.urlFlask}socio/addSocio`, socioInfo).subscribe(
      (response) => {
        this.success = response;
      },
      (error) => {
        console.error('Error al crear el socio:', error);
      });
    return this.success;
  }

  deleteSocio(id: number): Observable<any> {
    return this.http.delete(`${environment.urlFlask}socio/deleteSocio/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
