import {Component, Inject, Optional} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ClubMeetingModel} from '../models/ClubMeetingModel';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {RoleModel} from '../models/RoleModel';
import {environment} from '../../environments/environment';
import {MemberModel} from '../models/MemberModel';
import Util from '../utility/util';


@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {

  fieldName: string;
  action: string;
  from: string;
  localData: any;

  tableRoles: AngularFireList<any>;
  roles: Array<RoleModel>;
  tableMembers: AngularFireList<any>;
  members: Array<MemberModel>;
  date: any;
  maxDate: Date = new Date();

  dateFilter: any;

  constructor(private db: AngularFireDatabase,
              public dialogRef: MatDialogRef<DialogBoxComponent>,
    // @Optional() is used to prevent error if no data is passed
              @Optional() @Inject(MAT_DIALOG_DATA) public data: ClubMeetingModel) {
    console.log(data);
    this.localData = {...data};
    this.from = this.localData.from;
    this.fieldName = this.localData.fieldName;
    this.action = this.localData.action;

    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref => ref.orderByChild('sortIndex'));
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles.valueChanges().subscribe(listRoles => {
      this.roles = listRoles as Array<RoleModel>;
      this.tableMembers.valueChanges().subscribe(listMembers => {
        this.members = listMembers as Array<MemberModel>;
      });
    });

    if (this.from === 'from-new-history') {
     try{
       let dateStringArray = '';
       (Object.values(data)).forEach(d => {
         if (!isNaN(new Date(d).valueOf())){
          dateStringArray += Util.GetFormattedDate(new Date(d)) + ',';
         }
       });
       if (dateStringArray.length > 0) {
         this.dateFilter = (date: Date | null) => dateStringArray.indexOf(Util.GetFormattedDate(date)) < 0;
       }
     } catch (ex){}
    }
  }

  doAction(){
    this.dialogRef.close({event: this.action, from: this.from, data: this.localData});
  }

  closeDialog(){
    this.dialogRef.close({event: 'Cancel'});
  }

}

