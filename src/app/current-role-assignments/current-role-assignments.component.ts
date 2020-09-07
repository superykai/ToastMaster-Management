import {Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AngularFireDatabase, AngularFireList, snapshotChanges} from '@angular/fire/database';
import {environment} from '../../environments/environment';
import {generate, Observable, Subscription} from 'rxjs';
import {MemberModel} from "../models/MemberModel";
import {RoleModel} from "../models/RoleModel";
import {ClubMeetingModel} from "../models/ClubMeetingModel";
import {map} from "rxjs/operators";
import util from "../utility/util";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-current-role-assignments',
  templateUrl: './current-role-assignments.component.html',
  styleUrls: ['./current-role-assignments.component.css']
})
export class CurrentRoleAssignmentsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  submitBtnEnabled = false;

  minDate: Date;
  minNextDate: Date;
  minNextNextDate: Date;
  currentMeetDate: Date;
  nextMeetDate: Date;
  nextNextMeetDate: Date;

  memberSubscription: Subscription;
  roleSubscription: Subscription;
  historySubscription: Subscription;

  tableMembers: AngularFireList<any>;
  tableRoles: AngularFireList<any>;
  tableHistory: AngularFireList<any>;
  tableCurrent: AngularFireList<any>;
  tableNext: AngularFireList<any>;
  tableNextNext: AngularFireList<any>;

  members: Array<MemberModel>;
  roles: Array<RoleModel>;
  listOfHistories: Array<any>;
  history: Array<ClubMeetingModel>;
  current: Array<ClubMeetingModel>;
  nextMeet:  Array<ClubMeetingModel>;
  nextNextMeet:  Array<ClubMeetingModel>;

  displayCurrent: Array<ClubMeetingModel>;
  displayNextMeet:  Array<ClubMeetingModel>;
  displayNextNextMeet:  Array<ClubMeetingModel>;

  displayedColumns: string[] = ['roleName', 'assignedTo', 'timeLimit','email','memo'];

  dataSourceCurrent: any;
  dataSourceNextMeeting: any;
  dataSourceNextNextMeeting: any;


  constructor(private db: AngularFireDatabase,  public dialog: MatDialog) {
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref=>ref.orderByChild('roleName'));
    this.tableHistory = this.db.list<AngularFireList<any>>(environment.assignmentHistoryTable.name, ref=>ref.orderByChild('date'));
    this.tableCurrent = this.db.list<AngularFireList<any>>(environment.currentAssignmentTable.name, ref=>ref.orderByChild('date'));
    this.tableNext = this.db.list<AngularFireList<any>>(environment.nextAssignmentTable.name, ref=>ref.orderByChild('date'));
    this.tableNextNext = this.db.list<AngularFireList<any>>(environment.nextNextAssignmentTable.name, ref=>ref.orderByChild('date'));
    this.minDate = new Date(Date.now() + ( 3600 * 1000 * 24));
    this.minNextDate = new Date();
    this.minNextNextDate = new Date();
    this.minNextDate.setDate(this.minDate.getDate() + 1);
    this.minNextNextDate.setDate(this.minNextDate.getDate() + 1);
  }

  ngOnInit(): void {
    this.submitBtnEnabled = false;
    this.initializeMe();
  }

  ngAfterViewInit(): void {
    // setTimeout(() =>this.moveUpMeetings(),1000);


  }

  moveUpMeetings(){
    if (this.current && this.current.length >0){
      if (new Date(this.current[0].date) < new Date()){
        // today is new date, in table Current information should move to Assignment History table
        this.tableHistory.push(this.current);
        this.current = new Array<ClubMeetingModel>();
        this.tableCurrent.remove();
        if (this.nextMeet && this.nextMeet.length >0){
          // move next meetings to current one
          for (let i = 0; i< this.nextMeet.length; i++){
            this.tableCurrent.push(this.nextMeet[i]);
            this.current.push(this.nextMeet[i]);
          }
          this.nextMeet = new Array<ClubMeetingModel>();
          this.tableNext.remove();

          if (this.nextNextMeet && this.nextNextMeet.length > 0){
            // move nextNext meeting to next meeting
            for (let i = 0; i< this.nextNextMeet.length; i++){
              this.tableNext.push(this.nextNextMeet[i]);
            }
            this.nextNextMeet = new Array<ClubMeetingModel>();
            this.tableNextNext.remove();
            this.moveUpMeetings();
          }
        }
      }
     }
  }

  initializeMe(){
   this.tableCurrent.snapshotChanges().pipe(map(actions =>actions.map(a => ({ key: a.payload.key, ...a.payload.val() })))).subscribe(items =>{
   //  this.tableCurrent.valueChanges().subscribe(items =>{
      this.current = items as Array<ClubMeetingModel>;
     this.displayCurrent = this.current;
     this.dataSourceCurrent = new MatTableDataSource(this.displayCurrent);
     this.dataSourceCurrent.sort = this.sort;
    });

    this.tableNext.snapshotChanges().pipe(map(actions =>actions.map(a => ({ key: a.payload.key, ...a.payload.val() })))).subscribe(nitems =>{
      this.nextMeet = nitems as Array<ClubMeetingModel>;
      this.displayNextMeet = this.nextMeet;
      this.dataSourceNextMeeting = new MatTableDataSource(this.displayNextMeet);
      this.dataSourceNextMeeting.sort = this.sort;
    });

    this.tableNextNext.snapshotChanges().pipe(map(actions =>actions.map(a => ({ key: a.payload.key, ...a.payload.val() })))).subscribe(nnitems =>{
      this.nextNextMeet = nnitems as Array<ClubMeetingModel>;

      this.displayNextNextMeet = this.nextNextMeet;
      this.dataSourceNextNextMeeting = new MatTableDataSource(this.displayNextNextMeet);
      this.dataSourceNextNextMeeting.sort = this.sort;
    });

    this.roleSubscription = this.tableRoles.valueChanges().subscribe(listRoles => {
      this.roles = listRoles as Array<RoleModel>;

      this.memberSubscription = this.tableMembers.valueChanges().subscribe(listMembers => {
        this.members = listMembers as Array<MemberModel>;

        this.historySubscription = this.tableHistory
          .snapshotChanges().pipe(map(actions =>actions.map(a => ({ key: a.key, ...a.payload.val() }))))
          .subscribe(listHistory => {
            this.listOfHistories = listHistory;
          });
      });
    });
  }

  checkButtonEnabled(){
    if (this.currentMeetDate && this.nextNextMeetDate && this.nextMeetDate)
      this.submitBtnEnabled = true;
    else
      this.submitBtnEnabled = false;
  }

  reCheckUpTheExistingRoleAssignments(localMeetingRolesArray,clubMeeting){
    if (clubMeeting && clubMeeting.length > 0){
      clubMeeting.forEach(c => {
        let _member = this.members.find(m => m.guid ===c.assignedTo);
        if (_member){
          if (_member.canAssignRoles.indexOf(c.roleId.toString()) >= 0){
            // this person profile changed, need to remove it from assignment table
            localMeetingRolesArray.push(c);
          }
        }
      });
    }
  }

  reGenerateBtnClicked(){
    this.moveUpMeetings();
    setTimeout(()=>this.generateCurrentAssignments(), 1000);
  }

  generateCurrentAssignments(){

    this.submitBtnEnabled = false;

    this.tableCurrent.remove();
    this.tableNext.remove();
    this.tableNextNext.remove();
    let currentMeetingRoles = new Array();
    let nextMeetingRoles = new Array();
    let nextNextMeetingRoles = new Array();

    //how many history records do we need
    this.history=new Array<ClubMeetingModel>();

    let totalMembers = this.members.length;
    let totalHistories = this.listOfHistories.length;
    let totalRoles = this.roles.length;

    let numOfHistoriesNeed = totalMembers; // Math.floor(totalMembers / totalRoles);
    if (totalHistories < numOfHistoriesNeed)
      numOfHistoriesNeed = totalHistories;

    if (numOfHistoriesNeed > 0) {
      for (let idx = numOfHistoriesNeed - 1; idx > 0; idx--) {
        for (let i = 0; i < this.listOfHistories.length; i++) {
          for (const [key, val] of Object.entries(this.listOfHistories[i] as Array<ClubMeetingModel>)) {
            this.history.push(val);
          }
        }
      }
    }
    //calculate the weights for each members based on history roles
    this.calculateWeights();


    //start generate current role assignment, first sort from the person no done any role in history first, then done more roles
    this.members.sort((a, b) => (a.totalWeightInHistory+a.ageLevel) - (b.totalWeightInHistory+b.ageLevel));
    // this.members.forEach(m=> console.log(m.firstName , (m.totalWeightInHistory+m.ageLevel)));

    this.roles.sort((a,b) => b.weight - a.weight);

    this.reCheckUpTheExistingRoleAssignments(currentMeetingRoles,this.current);
    this.reCheckUpTheExistingRoleAssignments(nextMeetingRoles, this.nextMeet);
    this.reCheckUpTheExistingRoleAssignments(nextNextMeetingRoles, this.nextNextMeet);

    this.doingAssignments(currentMeetingRoles, nextMeetingRoles, nextNextMeetingRoles, this.tableCurrent, this.currentMeetDate, false);
    this.doingAssignments(nextMeetingRoles,currentMeetingRoles,nextNextMeetingRoles, this.tableNext, this.nextMeetDate, true);
    this.doingAssignments(nextNextMeetingRoles,currentMeetingRoles,nextMeetingRoles, this.tableNextNext, this.nextNextMeetDate, true);


   // this.initializeMe();
    setTimeout(()=> this.checkButtonEnabled(),800);

    console.log(currentMeetingRoles, nextMeetingRoles,nextNextMeetingRoles);

  }


  calculateWeights(){
    this.members.forEach(member => {
      let totalWeightForOneMember = 0;
      if (this.history && this.history.length>0) {
        let totalOneMemberInHistory = this.history.filter(h => h.assignedTo === member.guid);
        totalOneMemberInHistory.forEach(o => {
          totalWeightForOneMember = totalWeightForOneMember + Number((this.roles.filter(r => r.guid === o.roleId)[0]).weight);
        });
      }
      member.totalWeightInHistory = totalWeightForOneMember;
    });

  }

  doingAssignments(theOneWorkingOn, firstPrevious, secondPrevious, whichTable, meetDate, isForSpeakerRoleOnly){
    let _Roles = this.roles;
    if (isForSpeakerRoleOnly)
      _Roles = this.roles.filter(r=>r.isSpeakerRole);
    for (let cnt = 0; cnt < this.members.length; cnt++){
      if (firstPrevious.filter(cmr => cmr.assignedTo === this.members[cnt].guid).length > 0
        || secondPrevious.filter(cmr => cmr.assignedTo === this.members[cnt].guid).length > 0
        || (theOneWorkingOn.length>0 && theOneWorkingOn.filter(cmr => cmr.assignedTo === this.members[cnt].guid).length > 0)){
        //already had this person assigned, skip to next one
        continue;
      } else{
        for (let ridex = 0; ridex < _Roles.length; ridex++) {
          if (theOneWorkingOn.length > 0 && theOneWorkingOn.filter(cmr => cmr.roleId === _Roles[ridex].guid).length > 0){
            //already had this role assigned, skip to next one
            continue;
          } else{
            if (this.members[cnt].canAssignRoles.indexOf(_Roles[ridex].guid.toString())>=0 ) {
              //only add this member to this role if his canAssignedRoles collection has this option allowed
              this.ArrayObjectPush(theOneWorkingOn,meetDate,ridex,cnt);
            }
            break;
          }
        }
      }
    }
    theOneWorkingOn.forEach(r => {
      if (r.key) {
        delete r.key;
      }
      r.date = util.GetFormattedDate(meetDate);
      whichTable.push(r)
    });
  }


  ArrayObjectPush(ArrayObject, MeetingDate, RoleIndex, TableIndex){
    const jsonData = {
      'assignedTo': this.members[TableIndex].guid,
      'date': util.GetFormattedDate(MeetingDate),
      'memberName': this.members[TableIndex].lastName + ', ' + this.members[TableIndex].firstName,
      'email': this.members[TableIndex].email.trim().length>0? this.members[TableIndex].email : this.members.find(m=>m.guid ===this.members[TableIndex].primaryGuardian).email,
      'roleId': this.roles[RoleIndex].guid,
      'roleName': this.roles[RoleIndex].roleName,
      'timeLimit': this.roles[RoleIndex].isSpeakerRole? '5 - 7 Mins':'',
      'memo':'',
      'sortIndex': this.roles[RoleIndex].sortIndex
    };
    ArrayObject.push(jsonData);
    try {ArrayObject.sort((a, b) => a.sortIndex - b.sortIndex);} catch(ex){}
  }

  openDialog(action, from, fieldName, obj) {
    obj.action = action;
    obj.from = from;
    obj.fieldName = fieldName;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '280px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event.indexOf('Update-')>=0){

        const data = {
          'assignedTo': result.data.assignedTo,
          'date': result.data.date,
          'memberName': result.data.memberName,
          'email': result.data.email,
          'roleId': result.data.roleId,
          'roleName': result.data.roleName,
          'timeLimit': result.data.timeLimit,
          'memo':result.data.memo,
          'sortIndex': result.data.sortIndex
        };
        if (result.event.indexOf('Update-Current')>=0)
          this.tableCurrent.update(result.data.key, data);
        if (result.event.indexOf('Update-Next')>=0)
          this.tableNext.update(result.data.key, data);
        if (result.event.indexOf('Update-SecondNext')>=0)
          this.tableNextNext.update(result.data.key, data);
      }
    });
  }

  ngOnDestroy(){
    if (this.memberSubscription)
      this.memberSubscription.unsubscribe();
    if (this.roleSubscription)
      this.roleSubscription.unsubscribe();
  }

}
