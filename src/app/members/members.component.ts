import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSort} from '@angular/material/sort';
import {delay, map} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {environment} from '../../environments/environment';
import {MemberModel} from "../models/MemberModel";
import {RoleModel} from "../models/RoleModel";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  tableMembers: AngularFireList<any>;
  members: Array<MemberModel>;
  tableRoles: AngularFireList<any>;
  roles: Array<RoleModel>;

  memberSubscription: Subscription;
  roleSubscription: Subscription;

  constructor(private db: AngularFireDatabase,private activatedRoute: ActivatedRoute, private route: Router,public dialog: MatDialog) {
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref=>ref.orderByChild('sortIndex'));
  }

  displayedColumns: string[] = ['firstName', 'lastName','email','ageLevel','canBeRoles', 'guardian','action'];

  dataSource: any;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.roleSubscription = this.tableRoles
      .snapshotChanges().pipe(
        map(actions =>
          actions.map(a => ({ key: a.key, ...a.payload.val() }))
        )
      ).subscribe(items =>{
        this.roles = items as RoleModel[];

      this.memberSubscription = this.tableMembers
        .snapshotChanges().pipe(
          // delay(50),
          map(actions =>
            actions.map(a => ({ key: a.key, ...a.payload.val() }))
          )
        ).subscribe(items => {
          this.members = items as MemberModel[];
          this.members.forEach(member =>{
            let mem = this.members.filter(m => m.guid === member.primaryGuardian)[0];
            if (mem!=null)
              member.guardian = mem.lastName + ', ' + mem.firstName ;

            if (member.canAssignRoles.trim().length > 0){
              let canBeRoles = member.canAssignRoles.trim().split(',');
              member.canBeRoles = [];
              canBeRoles.forEach(cbr => {
                const oneRole =  this.roles.filter(r => r.guid === Number(cbr))[0];
                member.canBeRoles.push({'roleName': oneRole.roleName, 'sortIndex': oneRole.sortIndex});
              });
              member.canBeRoles.sort((a,b) => a.sortIndex - b.sortIndex);
            }
          });
          this.dataSource = new MatTableDataSource(this.members);
          this.dataSource.sort = this.sort;
        });
      });
  }

  openDialog(action, from, obj) {
    obj.action = action;
    obj.from = from;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '280px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete'){
        this.deleteRowData(result.data);
      }
    });
  }

  addRowData(){
    const path = '/members/add';
    this.route.navigateByUrl(path);
  }

  updateRowData(row){
    const path = '/members/'+ row.guid;
    this.route.navigateByUrl(path);
  }

  deleteRowData(row_obj){
    this.tableMembers.remove(row_obj.key);
  }

  ngOnDestroy(): void {
    if (this.memberSubscription)
      this.memberSubscription.unsubscribe();
    if (this.roleSubscription)
      this.roleSubscription.unsubscribe();
  }

}
