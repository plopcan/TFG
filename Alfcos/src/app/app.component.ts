import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { SocioListComponent } from './pages/socio-list/socio-list.component';
import { RouterModule } from '@angular/router';
import { SessionService } from './core/services/session.service';
import { AuthService } from './core/services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SocioListComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Alfcos';
  constructor(private session: SessionService,
    private authService: AuthService){}
  isloged(){
    return this.authService.isLoggedIn;
  }
  
}
