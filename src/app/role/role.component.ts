import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {RoleModel} from '../models/RoleModel';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {DialogBoxComponent} from '../dialog-box/dialog-box.component';
import {MatDialog} from '@angular/material/dialog';
import {MemberModel} from '../models/MemberModel';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  tableMembers: AngularFireList<any>;
  members: Array<MemberModel>;
  tableRoles: AngularFireList<any>;
  roles: Array<RoleModel>;
  roleSubscription: Subscription;
  memberSubscription: Subscription;

  displayedColumns: string[] = ['roleName', 'isSpeakerRole', 'isEvaluatorRole', 'weight', 'sortIndex', 'activated'];

  dataSource: any;

  constructor(private db: AngularFireDatabase, public dialog: MatDialog) {
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref => ref.orderByChild('sortIndex'));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.roleSubscription = this.tableRoles
      .snapshotChanges().pipe(
        map(actions =>
          actions.map(a => ({ key: a.key, ...a.payload.val() }))
        )
      ).subscribe(items => {
        this.roles = items as RoleModel[];
        this.dataSource = new MatTableDataSource(this.roles);
        this.dataSource.sort = this.sort;

        this.memberSubscription = this.tableMembers
          .snapshotChanges().pipe(
            // delay(50),
            map(actions =>
              actions.map(a => ({ key: a.key, ...a.payload.val() }))
            )
          ).subscribe(list => {
            this.members = list as MemberModel[];
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
      if (result.event === 'Add'){
        const guid = Number(new Date().valueOf());
        const data = {
          guid,
          activated: result.data.activated,
          isSpeakerRole: result.data.isSpeakerRole,
          isEvaluatorRole: result.data.isEvaluatorRole,
          roleName: result.data.roleName,
          sortIndex: Number(result.data.sortIndex),
          weight: Number(result.data.weight)};
        this.tableRoles.push(data);
        // by default, every members have this role available right away.
        this.members.forEach(m => {
          m.canAssignRoles += ',' + guid.toString();
          this.tableMembers.update(m.key, m);
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
    if (this.memberSubscription) {
      this.memberSubscription.unsubscribe();
    }
  }
}
