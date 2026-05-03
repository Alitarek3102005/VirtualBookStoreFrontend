import { Routes } from '@angular/router';
import { NavbarComponent } from './Components/navbar-component/navbar-component';
import { AthenaArchiveComponent } from './Components/athena-archive-component/athena-archive-component';
import { AuthComponent } from './Components/auth-component/auth-component';
import { RegisterComponent } from './Components/register-component/register-component';
import { ProductDetailComponent } from './Components/product-detail-component/product-detail-component';
import { CartComponent } from './Components/cart-component/cart-component';
import { LibraryComponent } from './Components/library-component/library-component';
import { OrderManifestComponent } from './Components/order-manifest-component/order-manifest-component';
import { OrderHistoryComponent } from './Components/order-history-component/order-history-component';
import { ProfileComponent } from './Components/profile-component/profile-component';
import { SubmitReviewComponent } from './Components/submit-review-component/submit-review-component';
import { VolumeEditorComponent } from './Components/volume-editor-component/volume-editor-component';
import { AdminDashboardComponent } from './Components/admin-dashboard-component/admin-dashboard-component';
import { OrderManagementComponent } from './Components/order-management-component/order-management-component';
import { ContentModerationComponent } from './Components/content-moderation-component/content-moderation-component';
import { UserManagementComponent } from './Components/user-management-component/user-management-component';
import { adminGuard } from './Guards/admin-guard';
import { AddBookComponent } from './Components/add-book-component/add-book-component';
import { CheckoutComponent } from './Components/checkout-component/checkout-component';
import { EditBookComponent } from './Components/edit-book-component/edit-book-component';
import { addBookGuardGuard } from './Guards/add-book-guard-guard';
import { OrderInfoComponent } from './Components/order-info-component/order-info-component';
import { CatalogManagementComponent } from './Components/catalog-management-component/catalog-management-component';
import { PaymentSuccessComponent } from './Components/payment-success-component/payment-success-component';
import { PaymentFailedComponent } from './Components/payment-failed-component/payment-failed-component';

export const routes: Routes = [
    {path: '', component: AthenaArchiveComponent},
    {path: "login", component:AuthComponent},
    {path: "register", component:RegisterComponent},
    {path: "product-details/:id", component:ProductDetailComponent},
    {path: "cart", component:CartComponent},
    {path: "library", component:LibraryComponent},
    {path: "order-detail/:id", component:OrderManifestComponent},
    {path: "order-history", component:OrderHistoryComponent},
    {path: "profile", component:ProfileComponent},
    {path: "submit-review/:id", component:SubmitReviewComponent},
    {path: "admin/inventory", component:VolumeEditorComponent,canActivate: [adminGuard]},
    {path: "admin-dashboard", component:AdminDashboardComponent,canActivate: [adminGuard]},
    {path: "admin/orders", component:OrderManagementComponent,canActivate: [adminGuard]},
    {path: "admin/reviews", component:ContentModerationComponent,canActivate: [adminGuard]},
    {path: "admin/users", component:UserManagementComponent,canActivate: [adminGuard]},
    {path: "logout", component:AuthComponent},
    {path:"add-book",component : AddBookComponent,canActivate: [addBookGuardGuard]},
    {path:"payment", component:CheckoutComponent},
    {path:"edit-book/:id", component:EditBookComponent,canActivate: [adminGuard]},
    {path:"order/:id",component:OrderInfoComponent},
    {path:"admin/catalog",component:CatalogManagementComponent,canActivate: [adminGuard]},
    {path:"success", component:PaymentSuccessComponent},
    {path:"failed",component:PaymentFailedComponent},
    { path: '**', redirectTo: '' },
    
];
