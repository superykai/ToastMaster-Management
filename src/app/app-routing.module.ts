import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CurrentRoleAssignmentsComponent} from "./current-role-assignments/current-role-assignments.component";
import {MembersComponent} from "./members/members.component";
import {ManageAllFilesComponent} from "./manage-all-files/manage-all-files.component";
import {MemberDetailComponent} from "./member-detail/member-detail.component";
import {RoleComponent} from "./role/role.component";
import {AssignmentHistoryComponent} from "./assignment-history/assignment-history.component";


const routes: Routes = [
  {
    path: '',
    component: CurrentRoleAssignmentsComponent
  },
  {
    path: 'members',
    component: MembersComponent
  },
  {
    path: 'members/:guid',
    component: MemberDetailComponent
  },
  {
    path: 'role',
    component: RoleComponent
  },
  {
    path: 'history',
    component: AssignmentHistoryComponent
  },
  {
    path: 'files/all',
    component: ManageAllFilesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
