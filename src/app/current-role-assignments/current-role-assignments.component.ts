import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import {MemberModel} from '../models/MemberModel';
import {RoleModel} from '../models/RoleModel';
import {ClubMeetingModel} from '../models/ClubMeetingModel';
import {map} from 'rxjs/operators';
import Util from '../utility/util';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {DialogBoxComponent} from '../dialog-box/dialog-box.component';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from "@angular/router";

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
  nextMeet: Array<ClubMeetingModel>;
  nextNextMeet: Array<ClubMeetingModel>;

  displayCurrent: Array<ClubMeetingModel>;
  displayNextMeet: Array<ClubMeetingModel>;
  displayNextNextMeet: Array<ClubMeetingModel>;

  displayedColumns: string[] = ['roleName', 'assignedTo', 'timeLimit', 'email', 'memo', 'action'];

  dataSourceCurrent: any;
  dataSourceNextMeeting: any;
  dataSourceNextNextMeeting: any;

  isLogined = false;
  isDebug = false;
  memberId = 0;

  constructor(private db: AngularFireDatabase,  public dialog: MatDialog, private activeRoute: ActivatedRoute) {
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref => ref.orderByChild('roleName'));
    this.tableHistory = this.db.list<AngularFireList<any>>(environment.assignmentHistoryTable.name, ref => ref.orderByChild('date'));
    this.tableCurrent = this.db.list<AngularFireList<any>>(environment.currentAssignmentTable.name, ref => ref.orderByChild('sortIndex'));
    this.tableNext = this.db.list<AngularFireList<any>>(environment.nextAssignmentTable.name, ref => ref.orderByChild('sortIndex'));
    this.tableNextNext = this.db.list<AngularFireList<any>>(environment.nextNextAssignmentTable.name, ref => ref.orderByChild('sortIndex'));
    this.minDate = new Date(Date.now() + ( 3600 * 1000 * 24));
    this.minNextDate = new Date();
    this.minNextNextDate = new Date();
    this.minNextDate.setDate(this.minDate.getDate() + 1);
    this.minNextNextDate.setDate(this.minNextDate.getDate() + 1);
    if (this.activeRoute.snapshot.queryParamMap.get('debug')){
      this.isDebug = true;
      let _memberId = this.activeRoute.snapshot.queryParamMap.get('memberId')
      if (_memberId && !isNaN(Number(_memberId))){
        this.memberId = Number(_memberId);
      }
    }
  }

  ngOnInit(): void {
    // if (localStorage.getItem('user')) {
    if (Util.getCookie('user')) {
      this.isLogined = true;
    }

    this.submitBtnEnabled = false;
    this.initializeMe();
  }

  ngAfterViewInit(): void {
    // setTimeout(() =>this.moveUpMeetings(),1000);

  }

  reSetBtnClicked(){
    // delete all current, next, nextNext meetins
    this.db.database.ref('currentAssignment').remove();
    this.db.database.ref('nextAssignment').remove();
    this.db.database.ref('nextNextAssignment').remove();
    this.current = new Array<ClubMeetingModel>();
    this.nextMeet = new Array<ClubMeetingModel>();
    this.nextNextMeet = new Array<ClubMeetingModel>();
  }

  moveUpMeetings(){
    if (this.current && this.current.length > 0){
      if (new Date(this.current[0].date) < new Date()){
        // today is new date, in table Current information should move to Assignment History table
        for (const iCur of this.current){
          if (iCur.key) {
            delete iCur.key;
          }
        }
        this.tableHistory.push(this.current);
        this.current = new Array<ClubMeetingModel>();
        this.tableCurrent.remove();
        if (this.nextMeet && this.nextMeet.length > 0){
          // move next meetings to current one
          for (const iNext of this.nextMeet){
            this.tableCurrent.push(iNext);
            this.current.push(iNext);
          }
          this.nextMeet = new Array<ClubMeetingModel>();
          this.tableNext.remove();

          if (this.nextNextMeet && this.nextNextMeet.length > 0){
            // move nextNext meeting to next meeting
            for (const iNextNext of this.nextNextMeet){
              this.tableNext.push(iNextNext);
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
   this.tableCurrent.snapshotChanges()
     .pipe(map(actions => actions.map(a => ({ key: a.payload.key, ...a.payload.val() }))))
     .subscribe(items => {
   //  this.tableCurrent.valueChanges().subscribe(items =>{
      this.current = items as Array<ClubMeetingModel>;
      this.displayCurrent = this.current;
      this.dataSourceCurrent = new MatTableDataSource(this.displayCurrent);
      this.dataSourceCurrent.sort = this.sort;
    });

   this.tableNext.snapshotChanges()
     .pipe(map(actions => actions.map(a => ({ key: a.payload.key, ...a.payload.val() }))))
     .subscribe(nitems => {
      this.nextMeet = nitems as Array<ClubMeetingModel>;
      this.displayNextMeet = this.nextMeet;
      this.dataSourceNextMeeting = new MatTableDataSource(this.displayNextMeet);
      this.dataSourceNextMeeting.sort = this.sort;
    });

   this.tableNextNext.snapshotChanges()
     .pipe(map(actions => actions.map(a => ({ key: a.payload.key, ...a.payload.val() }))))
     .subscribe(nnitems => {
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
          .snapshotChanges().pipe(map(actions => actions.map(a => ({ key: a.key, ...a.payload.val() }))))
          .subscribe(listHistory => {
            this.listOfHistories = listHistory;
          });
      });
    });
  }

  checkButtonEnabled(){
    this.submitBtnEnabled = !!(this.currentMeetDate && this.nextNextMeetDate && this.nextMeetDate);
  }

  reGenerateBtnClicked(){
    this.moveUpMeetings();
    setTimeout(() => this.generateCurrentAssignments(), 1000);
  }


  generateCurrentAssignments(){
    this.members.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
    this.roles.sort((a, b) => b.weight - a.weight);

    const totalMembers = this.members.length;
    const totalHistories = this.listOfHistories.length;
    // const totalRoles = this.roles.length;

    let numOfHistoriesNeed = totalMembers; // Math.floor(totalMembers / totalRoles);
    if (totalHistories < numOfHistoriesNeed) {
      numOfHistoriesNeed = totalHistories;
    }

    if (numOfHistoriesNeed > 0) {
      const history = new Array<ClubMeetingModel>();
      for (let i = totalHistories - 1; i >= totalHistories - numOfHistoriesNeed; i--) {

        for (const [key, val] of Object.entries(this.listOfHistories[i] as Array<ClubMeetingModel>)) {
          if (key !== 'key'){
            const result = {key: this.listOfHistories[i].key + '/' + key, date: val.date, roleId: val.roleId,
              roleName: '', assignedTo: val.assignedTo,
              email: '', memberName: '', memo: '', sortIndex: 0, timeLimit: '' };
            history.push(result);
          }
        }
        history.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
      }

      const historyAllRecords = new Array<any>();
      this.roles.forEach(r => {
       let howManyRecInOneRole: any[];
       howManyRecInOneRole = history.filter(h => h.roleId === r.guid);
       if (howManyRecInOneRole.length > 0) {
         let score = 1;
         for (const recInOneRole of howManyRecInOneRole) {
           historyAllRecords.push({
               roleId: r.guid,
               roleName: r.roleName,
               date: recInOneRole.date,
               assignedTo: recInOneRole.assignedTo,
               score
             });
           score += 1;
         }
        }
     });
      //-----start --- debugging code -- /?debug=true&memberId=15336
      if (this.isDebug) {
        if (this.memberId > 0) {
          historyAllRecords.forEach(h => {
            if (h.assignedTo === this.memberId)
              console.log(h);
          });
        }
        console.log(historyAllRecords);
      }


     // at this point, we have each role for each member scoring.
      const thisMemberForThisRoleRanking = new Array<any>();
      for (const oneMem of this.members) {
        this.roles.forEach(r => {
          if (r.activated){
            let whatScoreYouhave = 0;
            const jsonData = {roleId: r.guid, roleName: r.roleName, timeLimit: (r.isSpeakerRole) ? '5 - 7 Mins' : '',
              sortIndex: r.sortIndex, assignedTo: oneMem.guid, ageLevel: oneMem.ageLevel,
              memberName: oneMem.firstName + ' ' + oneMem.lastName, memo: '',
              email: (oneMem.email.length > 0) ? oneMem.email :
                this.members.find(m => m.guid === oneMem.primaryGuardian).email};
            const foundRec = historyAllRecords.filter(har => har.assignedTo === oneMem.guid && har.roleId === r.guid);
            if (foundRec.length > 0){
              for (const iRec of foundRec) {
                whatScoreYouhave += Number(iRec.score);
              }
              if (oneMem.canAssignRoles.indexOf(r.guid.toString()) >= 0) {// only add those can assigned role person in
                thisMemberForThisRoleRanking.push({...jsonData, ...{score: whatScoreYouhave}}); // + this.members[cnt].ageLevel}});
              }
            }
            else{
              if (oneMem.canAssignRoles.indexOf(r.guid.toString()) >= 0) {// only add those can assigned role person in
                thisMemberForThisRoleRanking.push({...jsonData, ...{score: 0}});
              }
            }
          }
        });
        // each person will combined speaker 1 & 2 & 3 score because speaker 1 & 2 & 3 dont have separate rotation
        const eachMemberSpeaker1 = thisMemberForThisRoleRanking.find(
          tmfrr => tmfrr.roleName === 'Speaker 1' && tmfrr.assignedTo === oneMem.guid);
        const eachMemberSpeaker2 = thisMemberForThisRoleRanking.find(
          tmfrr => tmfrr.roleName === 'Speaker 2' && tmfrr.assignedTo === oneMem.guid);
        const eachMemberSpeaker3 = thisMemberForThisRoleRanking.find(
          tmfrr => tmfrr.roleName === 'Speaker 3' && tmfrr.assignedTo === oneMem.guid);

        let speakerScore = 0;

        speakerScore = (eachMemberSpeaker1? eachMemberSpeaker1.score : 0) + (eachMemberSpeaker2? eachMemberSpeaker2.score : 0) + (eachMemberSpeaker3? eachMemberSpeaker3.score : 0);
        // if member is adult, then add more score, so they will rotate slower than kids, kids get the role faster
        if ((eachMemberSpeaker1 && eachMemberSpeaker1.ageLevel ===2) ||
          (eachMemberSpeaker2 && eachMemberSpeaker2.ageLevel ===2) ||
          (eachMemberSpeaker3 && eachMemberSpeaker3.ageLevel ===2)) // adult
          speakerScore += 15;
        if (eachMemberSpeaker1)
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberSpeaker1).score = speakerScore;
        if (eachMemberSpeaker2)
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberSpeaker2).score = speakerScore;
        if (eachMemberSpeaker3)
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberSpeaker3).score = speakerScore;

        // doing same to evaluator 1 & 2 & 3
        const eachMemberEvaluator1 = thisMemberForThisRoleRanking.find(
          tmfrr => tmfrr.roleName === 'Evaluator 1' && tmfrr.assignedTo === oneMem.guid);
        const eachMemberEvaluator2 = thisMemberForThisRoleRanking.find(
          tmfrr => tmfrr.roleName === 'Evaluator 2' && tmfrr.assignedTo === oneMem.guid);
        const eachMemberEvaluator3 = thisMemberForThisRoleRanking.find(
          tmfrr => tmfrr.roleName === 'Evaluator 3' && tmfrr.assignedTo === oneMem.guid);

        let evaluatorScore = 0;

        evaluatorScore = (eachMemberEvaluator1? eachMemberEvaluator1.score : 0) + (eachMemberEvaluator2? eachMemberEvaluator2.score : 0) + (eachMemberEvaluator3? eachMemberEvaluator3.score : 0);
        // if member is adult, then add more score, so they will rotate slower than kids, kids get the role faster
        if ((eachMemberEvaluator1 && eachMemberEvaluator1.ageLevel ===2) ||
          (eachMemberEvaluator2 && eachMemberEvaluator2.ageLevel ===2) ||
          (eachMemberEvaluator3 && eachMemberEvaluator3.ageLevel ===2)) // adult
          evaluatorScore += 15;
        if (eachMemberEvaluator1)
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberEvaluator1).score = evaluatorScore;
        if (eachMemberEvaluator2)
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberEvaluator2).score = evaluatorScore;
        if (eachMemberEvaluator3)
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberEvaluator3).score = evaluatorScore;

      }
      //-----start --- debugging code -- /?debug=true&memberId=15336
      if (this.isDebug) {
        if (this.memberId > 0) {
          thisMemberForThisRoleRanking.forEach(t => {
            if (t.assignedTo === this.memberId)
              console.log(t);
          });
        }
        console.log('----all members----');
        console.log(thisMemberForThisRoleRanking);
      }

      // start assign roles for current meeting, do speaker role assignment first
      this.assigningRoles(thisMemberForThisRoleRanking, 'currentAssignment', this.current, this.nextMeet,
        this.nextNextMeet, this.currentMeetDate, true, false);
      this.assigningRoles(thisMemberForThisRoleRanking, 'nextAssignment', this.nextMeet, this.current,
        this.nextNextMeet, this.nextMeetDate, true, false);
      this.assigningRoles(thisMemberForThisRoleRanking, 'nextNextAssignment', this.nextNextMeet, this.current,
        this.nextMeet,  this.nextNextMeetDate, true, false);

      // second pirority is evaluator roles, but only need current assignment
      this.assigningRoles(thisMemberForThisRoleRanking, 'currentAssignment', this.current, this.nextMeet,
        this.nextNextMeet, this.currentMeetDate, false, true);


      // then other roles, because speaker roles has high pirority, since only current assignment need other role, only do one
      this.assigningRoles(thisMemberForThisRoleRanking, 'currentAssignment', this.current, this.nextMeet,
        this.nextNextMeet, this.currentMeetDate, false, false);
    }

  }

  assigningRoles(thisMemberForThisRoleRanking, nameOfServerTable, whichMeeting, nextMeeting,
                 nextNextMeeting, meetDate, isForSpeakerRolesOnly, isEvaluatorRoleOnly){
    const meetingDate = Util.GetFormattedDate(meetDate);
    let myRoles = this.roles;
    if (isForSpeakerRolesOnly) {
      myRoles = this.roles.filter(r => r.isSpeakerRole);
    }
    else if (isEvaluatorRoleOnly) {
      myRoles = this.roles.filter(r => r.isEvaluatorRole);
 }
    myRoles.forEach(r => {
      if (r.activated && !whichMeeting.find(wm => wm.roleId === r.guid)) {
        const oneRoleMemberList: Array<any> = thisMemberForThisRoleRanking.filter(ttrr => ttrr.roleId === r.guid);
        oneRoleMemberList.sort((a, b) => a.score - b.score);
        //-----start --- debugging code -- /?debug=true&memberId=15336
        if (this.isDebug)
          console.log(oneRoleMemberList);

        for (const oneRoleMem of oneRoleMemberList){
          const resultData = {...{date: meetingDate}, ...oneRoleMem};
          if (isForSpeakerRolesOnly || isEvaluatorRoleOnly) {
            if (!whichMeeting.find(c => c.assignedTo === oneRoleMem.assignedTo)
              && !nextMeeting.find(n => n.assignedTo === oneRoleMem.assignedTo)
              && !nextNextMeeting.find(nn => nn.assignedTo === oneRoleMem.assignedTo)) {
              whichMeeting.push(resultData);
              // console.log(resultData);
              break;
            }
          }
          else{
            // is not speaker role or evaluator role
            if (!whichMeeting.find(c => c.assignedTo === oneRoleMem.assignedTo)){
              whichMeeting.push(resultData);
              // console.log(resultData);
              break;
            }
          }
        }
      }
    });
    this.db.database.ref(nameOfServerTable).remove();
    whichMeeting.forEach(wm => {
      if (wm.key)
        delete wm.key;
      const ref = this.db.database.ref(nameOfServerTable).push();
      ref.set({...{key: ref.key}, ...wm});
    });
  }


  updateCurrentTable(element){
    this.rebuildElementArray(element);
    this.tableCurrent.update(element.key, element);
  }

  updateNextTable(element){
    this.rebuildElementArray(element);
    this.tableNext.update(element.key, element);
  }

  updateNextNextTable(element){
    this.rebuildElementArray(element);
    this.tableNextNext.update(element.key, element);
  }

  rebuildElementArray(element){
    if (element.roleName && element.roleName.toLowerCase().indexOf('speaker') >= 0) {
      element.timeLimit = '5 - 7 Mins';
    }
    else {
      element.timeLimit = '';
    }
    element.memo = '';
    element.email = '';
    element.memberName = '';
    const foundMember = this.members.find(m => m.guid === element.assignedTo);

    if (foundMember) {
      element.memberName = foundMember.firstName + ' ' + foundMember.lastName;

      if (foundMember.email.length > 0) {
        element.email = foundMember.email;
      } else {
        element.email = this.members.find(m => m.guid === foundMember.primaryGuardian).email;
      }
    }
  }

  openDialog(action, from, fieldName, obj) {
    obj.action = action;
    obj.from = from;
    obj.fieldName = fieldName;
    let width = '280px';
    if (from === 'from-agenda'){
      width = '350px';
    }
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: width,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event.indexOf('Update-') >= 0){

        const data = {
          assignedTo: result.data.assignedTo,
          date: result.data.date,
          memberName: result.data.memberName,
          email: result.data.email,
          roleId: result.data.roleId,
          roleName: result.data.roleName,
          timeLimit: result.data.timeLimit,
          memo: result.data.memo,
          sortIndex: result.data.sortIndex
        };
        if (result.event.indexOf('Update-Current') >= 0) {
          this.tableCurrent.update(result.data.key, data);
        }
        if (result.event.indexOf('Update-Next') >= 0) {
          this.tableNext.update(result.data.key, data);
        }
        if (result.event.indexOf('Update-SecondNext') >= 0) {
          this.tableNextNext.update(result.data.key, data);
        }
      }
      if (result.event === 'Delete'){
        if (result.data.from === 'from-assignment-current'){
          this.tableCurrent.remove(result.data.key);
        }
        if (result.data.from === 'from-assignment-next'){
          this.tableNext.remove(result.data.key);
        }
        if (result.data.from === 'from-assignment-nextnext'){
          this.tableNextNext.remove(result.data.key);
        }
      }
    });
  }

  ngOnDestroy(){
    if (this.memberSubscription) {
      this.memberSubscription.unsubscribe();
    }
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
  }

  agendaGenerate(){
    const htmlAgenda = Util.agendaGenerator(this.current, this.nextMeet, this.nextNextMeet);
    this.openDialog('Ok', 'from-agenda', htmlAgenda,{});
  }

  sendEmailForCurrent(){
    this.sendEmail(this.current);
  }

  sendEmailForNext(){
    this.sendEmail(this.nextMeet);
  }

  sendEmailForNextNext(){
    this.sendEmail(this.nextNextMeet);
  }

  sendEmail(meetingArray){
    if (meetingArray.length > 0){
      meetingArray.forEach(function(c, index) {
        setTimeout(function() {
          if (c.roleName.indexOf('Speaker') >= 0)
            Util.sendEmail(c.roleName, c.memberName, c.email, c.date, true);
          else
            Util.sendEmail(c.roleName, c.memberName, c.email, c.date, false);
        }, 5000 * (index + 1));
      });
    }
  }

  sendSingleEmail(c) {
    if (c.roleName.indexOf('Speaker') >= 0) {
      Util.sendEmail(c.roleName, c.memberName, c.email, c.date, true);
    }
    else {
      Util.sendEmail(c.roleName, c.memberName, c.email, c.date, false);
    }
  }

}
