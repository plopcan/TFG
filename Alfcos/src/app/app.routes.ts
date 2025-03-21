import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SocioListComponent } from './pages/socio-list/socio-list.component';
import { AppComponent } from './app.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { SocioFormComponent } from './pages/socio-list/socio-form/socio-form.component';

export const routes: Routes = [{
    path: "", component: LoginComponent
    },{
    path: "socios", component: SocioListComponent
    },{
        path: "home", component: AppComponent
        },{
            path: "usuarios", component: UserListComponent
            },{
                path: "usuario", component: UsuarioComponent
                },{
                    path: "socioForm", component: SocioFormComponent
                    }];
