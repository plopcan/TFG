import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SessionService } from './core/services/session.service';
import { AuthService } from './core/services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Alfcos';
  constructor(private session: SessionService,
    private authService: AuthService, private router: Router){}
  isloged(){
    return this.authService.isLoggedIn;
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  
}
