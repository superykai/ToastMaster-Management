import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule} from '@angular/fire/firestore';
import { environment} from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule} from './material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe} from '@angular/common';
import { MatTableModule} from '@angular/material/table';
import { MatSortModule} from '@angular/material/sort';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';

import { UploaderComponent } from './uploader/uploader/uploader.component';
import { UploadTaskComponent } from './uploader/upload-task/upload-task.component';
import { DropzoneDirective } from './dropzone.directive';
import { ManageAllFilesComponent } from './manage-all-files/manage-all-files.component';
import { MembersComponent } from './members/members.component';
import { CurrentRoleAssignmentsComponent } from './current-role-assignments/current-role-assignments.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import {MatListModule} from "@angular/material/list";
import { RoleComponent } from './role/role.component';
import {MatSelectModule} from "@angular/material/select";
import { AssignmentHistoryComponent } from './assignment-history/assignment-history.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@NgModule({
  declarations: [
    AppComponent,
    DialogBoxComponent,
    DropzoneDirective,
    UploaderComponent,
    UploadTaskComponent,
    ManageAllFilesComponent,
    MembersComponent,
    CurrentRoleAssignmentsComponent,
    MemberDetailComponent,
    RoleComponent,
    AssignmentHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    MatListModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  entryComponents: [DialogBoxComponent],
  exports: [],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
