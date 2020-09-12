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

  displayedColumns: string[] = ['roleName', 'assignedTo', 'timeLimit','email','memo','action'];

  dataSourceCurrent: any;
  dataSourceNextMeeting: any;
  dataSourceNextNextMeeting: any;


  constructor(private db: AngularFireDatabase,  public dialog: MatDialog) {
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref=>ref.orderByChild('roleName'));
    this.tableHistory = this.db.list<AngularFireList<any>>(environment.assignmentHistoryTable.name, ref=>ref.orderByChild('date'));
    this.tableCurrent = this.db.list<AngularFireList<any>>(environment.currentAssignmentTable.name, ref=>ref.orderByChild('sortIndex'));
    this.tableNext = this.db.list<AngularFireList<any>>(environment.nextAssignmentTable.name, ref=>ref.orderByChild('sortIndex'));
    this.tableNextNext = this.db.list<AngularFireList<any>>(environment.nextNextAssignmentTable.name, ref=>ref.orderByChild('sortIndex'));
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

  reSetBtnClicked(){
    //delete all current, next, nextNext meetins
    this.db.database.ref('currentAssignment').remove();
    this.db.database.ref('nextAssignment').remove();
    this.db.database.ref('nextNextAssignment').remove();
    this.current = new Array<ClubMeetingModel>();
    this.nextMeet = new Array<ClubMeetingModel>();
    this.nextNextMeet = new Array<ClubMeetingModel>();
  }

  moveUpMeetings(){
    if (this.current && this.current.length >0){
      if (new Date(this.current[0].date) < new Date()){
        // today is new date, in table Current information should move to Assignment History table
        for (let i = 0; i< this.current.length; i++){
          if (this.current[i].key)
            delete this.current[i].key;
        }
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

  // reCheckUpTheExistingRoleAssignments(localMeetingRolesArray,clubMeeting){
  //   if (clubMeeting && clubMeeting.length > 0){
  //     clubMeeting.forEach(c => {
  //       let _member = this.members.find(m => m.guid ===c.assignedTo);
  //       if (_member){
  //         if (_member.canAssignRoles.indexOf(c.roleId.toString()) >= 0){
  //           // this person profile changed, need to remove it from assignment table
  //           localMeetingRolesArray.push(c);
  //         }
  //       }
  //     });
  //   }
  // }

  reGenerateBtnClicked(){
    this.moveUpMeetings();
    setTimeout(()=>this.generateCurrentAssignments(), 1000);
  }

  // generateCurrentAssignments(){
  //
  //   this.submitBtnEnabled = false;
  //
  //   this.tableCurrent.remove();
  //   this.tableNext.remove();
  //   this.tableNextNext.remove();
  //   let currentMeetingRoles = new Array();
  //   let nextMeetingRoles = new Array();
  //   let nextNextMeetingRoles = new Array();
  //
  //   //how many history records do we need
  //   this.history=new Array<ClubMeetingModel>();
  //
  //   let totalMembers = this.members.length;
  //   let totalHistories = this.listOfHistories.length;
  //   let totalRoles = this.roles.length;
  //
  //   let numOfHistoriesNeed = totalMembers; // Math.floor(totalMembers / totalRoles);
  //   if (totalHistories < numOfHistoriesNeed)
  //     numOfHistoriesNeed = totalHistories;
  //
  //   if (numOfHistoriesNeed > 0) {
  //     for (let i = totalHistories-1; i >= totalHistories-numOfHistoriesNeed; i--) {
  //       for (const [key, val] of Object.entries(this.listOfHistories[i] as Array<ClubMeetingModel>)) {
  //         this.history.push({'key': key, 'roleName': val.roleName, 'timeLimit':val.timeLimit, 'sortIndex': val.sortIndex, 'memberName': val.memberName, 'assignedTo': val.assignedTo, 'roleId': val.roleId, 'date': val.date, 'email':val.email, 'memo':val.memo});
  //       }
  //     }
  //   }
  //
  //   //calculate the weights for each members based on history roles
  //   this.calculateWeights();
  //
  //
  //   //start generate current role assignment, first sort from the person no done any role in history first, then done more roles
  //   this.members.sort((a, b) => (a.totalWeightInHistory+a.ageLevel) - (b.totalWeightInHistory+b.ageLevel));
  //
  //
  //   this.roles.sort((a,b) => b.weight - a.weight);
  //
  //   this.reCheckUpTheExistingRoleAssignments(currentMeetingRoles,this.current);
  //   this.reCheckUpTheExistingRoleAssignments(nextMeetingRoles, this.nextMeet);
  //   this.reCheckUpTheExistingRoleAssignments(nextNextMeetingRoles, this.nextNextMeet);
  //
  //   this.doingAssignments(currentMeetingRoles, nextMeetingRoles, nextNextMeetingRoles, this.tableCurrent, this.currentMeetDate, false);
  //   this.doingAssignments(nextMeetingRoles,currentMeetingRoles,nextNextMeetingRoles, this.tableNext, this.nextMeetDate, true);
  //   this.doingAssignments(nextNextMeetingRoles,currentMeetingRoles,nextMeetingRoles, this.tableNextNext, this.nextNextMeetDate, true);
  //
  //
  //  // this.initializeMe();
  //   setTimeout(()=> this.checkButtonEnabled(),800);
  //
  //   console.log(currentMeetingRoles, nextMeetingRoles,nextNextMeetingRoles);
  //
  // }


  // calculateWeights(){
  //   this.members.forEach(member => {
  //     let totalWeightForOneMember = 0;
  //     if (this.history && this.history.length>0) {
  //       let totalOneMemberInHistory = this.history.filter(h => h.assignedTo === member.guid);
  //       totalOneMemberInHistory.forEach(o => {
  //         totalWeightForOneMember = totalWeightForOneMember + Number((this.roles.filter(r => r.guid === o.roleId)[0]).weight);
  //       });
  //     }
  //     member.totalWeightInHistory = totalWeightForOneMember;
  //   });
  //
  // }

  generateCurrentAssignments(){
    this.members.sort((a, b) => (a.firstName+a.lastName).localeCompare(b.firstName+b.lastName));
    this.roles.sort((a,b) => b.weight - a.weight);

    let totalMembers = this.members.length;
    let totalHistories = this.listOfHistories.length;
    let totalRoles = this.roles.length;

    let numOfHistoriesNeed = totalMembers; // Math.floor(totalMembers / totalRoles);
    if (totalHistories < numOfHistoriesNeed)
      numOfHistoriesNeed = totalHistories;

    if (numOfHistoriesNeed > 0) {
      let history = new Array<ClubMeetingModel>();
      for (let i = totalHistories-1; i >= totalHistories-numOfHistoriesNeed; i--) {

        for (const [key, val] of Object.entries(this.listOfHistories[i] as Array<ClubMeetingModel>)) {
          if (key!='key'){
            let result = {'key': this.listOfHistories[i].key + '/' + key, 'date': val.date,'roleId':val.roleId,'roleName': '','assignedTo': val.assignedTo,
              'email': '', 'memberName':'', 'memo': '', 'sortIndex':0, 'timeLimit': '' };
            history.push(result);
          }
        }
        history.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
      }

      let historyAllRecords = new Array<any>();
     this.roles.forEach(r =>{
       let howManyRecInOneRole: any[];
       howManyRecInOneRole = history.filter(h =>h.roleId ===r.guid);
        if (howManyRecInOneRole.length>0) {
         let score = 1;
         for (let i = 0; i < howManyRecInOneRole.length; i++) {

           historyAllRecords.push({
               'roleId': r.guid,
               'roleName': r.roleName,
               'date': howManyRecInOneRole[i].date,
               'assignedTo': howManyRecInOneRole[i].assignedTo,
               'score': score
             });
           score += 1;
         }
        }
     });

       //console.log(historyAllRecords);


     // at this point, we have each role for each member scoring.
      let thisMemberForThisRoleRanking = new Array<any>();
      for (let cnt = 0; cnt < this.members.length; cnt++) {
        this.roles.forEach(r => {
          if (r.activated){
            let whatScoreYouhave = 0;
            let jsonData = {'roleId': r.guid,'roleName': r.roleName, 'timeLimit': (r.isSpeakerRole)? '5 - 7 Mins': '',
              'sortIndex': r.sortIndex, 'assignedTo': this.members[cnt].guid,'memberName':this.members[cnt].firstName + ' ' + this.members[cnt].lastName, 'memo':'',
              'email': (this.members[cnt].email.length>0)? this.members[cnt].email: this.members.find(m=>m.guid ===this.members[cnt].primaryGuardian).email}
            let foundRec = historyAllRecords.filter(har => har.assignedTo === this.members[cnt].guid && har.roleId === r.guid);
            if (foundRec.length>0){
              for (let i=0; i<foundRec.length;i++){
                whatScoreYouhave += Number(foundRec[i].score);
              }
              if (this.members[cnt].canAssignRoles.indexOf(r.guid.toString())>=0) {// only add those can assigned role person in
                thisMemberForThisRoleRanking.push({...jsonData, ...{'score': whatScoreYouhave}}); // + this.members[cnt].ageLevel}});
              }
            }
            else{
              if (this.members[cnt].canAssignRoles.indexOf(r.guid.toString())>=0)// only add those can assigned role person in
                thisMemberForThisRoleRanking.push({...jsonData, ...{'score': 0}});
            }
          }
        });
        //each person will combined speaker 1 & 2 score because speaker 1 & 2 dont have separate rotation
        let eachMemberSpeaker1 = thisMemberForThisRoleRanking.find(tmfrr =>tmfrr.roleName==='Speaker 1' && tmfrr.assignedTo === this.members[cnt].guid);
        let eachMemberSpeaker2 = thisMemberForThisRoleRanking.find(tmfrr =>tmfrr.roleName==='Speaker 2' && tmfrr.assignedTo === this.members[cnt].guid);

        let speakerScore =0;
        if (eachMemberSpeaker1 && eachMemberSpeaker2) {
          speakerScore = eachMemberSpeaker1.score + eachMemberSpeaker2.score;
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberSpeaker1).score = speakerScore;
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberSpeaker2).score = speakerScore;
        }
        //doing same to evaluator 1 & 2
        let eachMemberEvaluator1 = thisMemberForThisRoleRanking.find(tmfrr =>tmfrr.roleName==='Evaluator 1' && tmfrr.assignedTo === this.members[cnt].guid);
        let eachMemberEvaluator2 = thisMemberForThisRoleRanking.find(tmfrr =>tmfrr.roleName==='Evaluator 2' && tmfrr.assignedTo === this.members[cnt].guid);

        let evaluatorScore =0;
        if (eachMemberEvaluator1 && eachMemberEvaluator2) {
          evaluatorScore = eachMemberEvaluator1.score + eachMemberEvaluator2.score;
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberEvaluator1).score = evaluatorScore;
          thisMemberForThisRoleRanking.find(tmfrr => tmfrr === eachMemberEvaluator2).score = evaluatorScore;
        }
      }

       // console.log(thisMemberForThisRoleRanking);

      //start assign roles for current meeting, do speaker role assignment first
      this.assigningRoles(thisMemberForThisRoleRanking, 'currentAssignment', this.current,this.nextMeet, this.nextNextMeet,this.currentMeetDate,true,false);
      this.assigningRoles(thisMemberForThisRoleRanking,'nextAssignment', this.nextMeet,this.current,this.nextNextMeet, this.nextMeetDate,true,false);
      this.assigningRoles(thisMemberForThisRoleRanking, 'nextNextAssignment', this.nextNextMeet,this.current,this.nextMeet,  this.nextNextMeetDate,true,false);

      // second pirority is evaluator roles, but only need current assignment
      this.assigningRoles(thisMemberForThisRoleRanking, 'currentAssignment', this.current,this.nextMeet, this.nextNextMeet,this.currentMeetDate,false,true);


      //then other roles, because speaker roles has high pirority, since only current assignment need other role, only do one
      this.assigningRoles(thisMemberForThisRoleRanking, 'currentAssignment', this.current,this.nextMeet, this.nextNextMeet,this.currentMeetDate,false,false);
    }

  }

  assigningRoles(thisMemberForThisRoleRanking, nameOfServerTable, whichMeeting, nextMeeting, nextNextMeeting, meetDate,isForSpeakerRolesOnly, isEvaluatorRoleOnly){
    let _meetDate = util.GetFormattedDate(meetDate);
    let _Roles = this.roles;
    if (isForSpeakerRolesOnly)
      _Roles = this.roles.filter(r=>r.isSpeakerRole);
    else if (isEvaluatorRoleOnly)
      _Roles = this.roles.filter(r =>r.isEvaluatorRole);
    _Roles.forEach(r => {
      if (r.activated && !whichMeeting.find(wm =>wm.roleId === r.guid)) {
        let oneRoleMemberList: Array<any> = thisMemberForThisRoleRanking.filter(ttrr=> ttrr.roleId === r.guid);
        oneRoleMemberList.sort((a,b) => a.score-b.score);
        console.log(oneRoleMemberList);

        for (let i=0; i< oneRoleMemberList.length; i++){
          let resultData ={...{'date': _meetDate}, ...oneRoleMemberList[i]};
          if(!whichMeeting.find(c=>c.assignedTo === oneRoleMemberList[i].assignedTo)
            && !nextMeeting.find(n=>n.assignedTo===oneRoleMemberList[i].assignedTo)
            && !nextNextMeeting.find(nn=>nn.assignedTo===oneRoleMemberList[i].assignedTo)) {
            whichMeeting.push(resultData);
            //console.log(resultData);
            break;
          }
        }
      }
    });
    this.db.database.ref(nameOfServerTable).remove();
    whichMeeting.forEach(wm => {
      let ref = this.db.database.ref(nameOfServerTable).push();
      ref.set({...{'key':ref.key}, ...wm});
    });
  }

  // doingAssignments(theOneWorkingOn, firstPrevious, secondPrevious, whichTable, meetDate, isForSpeakerRoleOnly){
  //   let _Roles = this.roles;
  //   if (isForSpeakerRoleOnly)
  //     _Roles = this.roles.filter(r=>r.isSpeakerRole);
  //   for (let cnt = 0; cnt < this.members.length; cnt++){
  //     if (firstPrevious.filter(cmr => cmr.assignedTo === this.members[cnt].guid).length > 0
  //       || secondPrevious.filter(cmr => cmr.assignedTo === this.members[cnt].guid).length > 0
  //       || (theOneWorkingOn.length>0 && theOneWorkingOn.filter(cmr => cmr.assignedTo === this.members[cnt].guid).length > 0)){
  //       //already had this person assigned, skip to next one
  //       continue;
  //     } else{
  //       for (let ridex = 0; ridex < _Roles.length; ridex++) {
  //         if (theOneWorkingOn.length > 0 && theOneWorkingOn.filter(cmr => cmr.roleId === _Roles[ridex].guid).length > 0){
  //           //already had this role assigned, skip to next one
  //           continue;
  //         } else{
  //           if (this.members[cnt].canAssignRoles.indexOf(_Roles[ridex].guid.toString())>=0 ) {
  //             //only add this member to this role if his canAssignedRoles collection has this option allowed
  //             this.ArrayObjectPush(theOneWorkingOn,meetDate,ridex,cnt);
  //           }
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   try {theOneWorkingOn.sort((a, b) => a.sortIndex - b.sortIndex);} catch(ex){}
  //   theOneWorkingOn.forEach(r => {
  //     if (r.key) {
  //       delete r.key;
  //     }
  //     r.date = util.GetFormattedDate(meetDate);
  //     whichTable.push(r)
  //   });
  // }
  //
  //
  // ArrayObjectPush(ArrayObject, MeetingDate, RoleIndex, TableIndex){
  //   const jsonData = {
  //     'assignedTo': this.members[TableIndex].guid,
  //     'date': util.GetFormattedDate(MeetingDate),
  //     'memberName': this.members[TableIndex].lastName + ', ' + this.members[TableIndex].firstName,
  //     'email': this.members[TableIndex].email.trim().length>0? this.members[TableIndex].email : this.members.find(m=>m.guid ===this.members[TableIndex].primaryGuardian).email,
  //     'roleId': this.roles[RoleIndex].guid,
  //     'roleName': this.roles[RoleIndex].roleName,
  //     'timeLimit': this.roles[RoleIndex].isSpeakerRole? '5 - 7 Mins':'',
  //     'memo':'',
  //     'sortIndex': this.roles[RoleIndex].sortIndex
  //   };
  //   ArrayObject.push(jsonData);
  // }

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
    this.tableNextNext.update(element.key,element);
  }

  rebuildElementArray(element){
    if(element.roleName.toLowerCase().indexOf('speaker')>=0)
      element.timeLimit = '5 - 7 Mins';
    else
      element.timeLimit ='';
    element.memo ='';
    let _foundMember = this.members.find(m=>m.guid===element.assignedTo);
    if (_foundMember.email.length>0){
      element.email = _foundMember.email;
    }
    else
      element.email = this.members.find(m => m.guid === _foundMember.primaryGuardian).email;
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
      if (result.event == 'Delete'){
        if (result.data.from=='from-assignment-current'){
          this.tableCurrent.remove(result.data.key);
        }
        if (result.data.from=='from-assignment-next'){
          this.tableNext.remove(result.data.key);
        }
        if (result.data.from=='from-assignment-nextnext'){
          this.tableNextNext.remove(result.data.key);
        }
      }
    });
  }

  ngOnDestroy(){
    if (this.memberSubscription)
      this.memberSubscription.unsubscribe();
    if (this.roleSubscription)
      this.roleSubscription.unsubscribe();
    if (this.historySubscription)
      this.historySubscription.unsubscribe();
  }

}
