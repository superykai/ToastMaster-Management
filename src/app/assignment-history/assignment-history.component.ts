import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {AngularFireDatabase, AngularFireList, snapshotChanges} from '@angular/fire/database';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import {MemberModel} from "../models/MemberModel";
import {RoleModel} from "../models/RoleModel";
import {ClubMeetingModel} from "../models/ClubMeetingModel";
import {map} from "rxjs/operators";
import util from "../utility/util";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";

@Component({
  selector: 'app-assignment-history',
  templateUrl: './assignment-history.component.html',
  styleUrls: ['./assignment-history.component.css']
})
export class AssignmentHistoryComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  displayedColumns: string[] = ['roleName', 'assignedTo','date', 'action'];
  dataSource: Array<any>;

  memberSubscription: Subscription;
  roleSubscription: Subscription;
  historySubscription: Subscription;

  tableMembers: AngularFireList<any>;
  tableRoles: AngularFireList<any>;
  tableHistory: AngularFireList<any>;

  members: Array<MemberModel>;
  roles: Array<RoleModel>;
  listOfHistories: Array<any>;
  histories: Array<Array<ClubMeetingModel>>;

  numOfHistoriesNeed: number;
  historyDates: Array<any>;

  isWaiting: boolean = false;

  constructor(private db: AngularFireDatabase,public dialog: MatDialog) {
    this.tableMembers = this.db.list<AngularFireList<any>>(environment.memberTable.name, ref => ref.orderByChild('lastName'));
    this.tableRoles = this.db.list<AngularFireList<any>>(environment.roleTable.name, ref=>ref.orderByChild('sortIndex'));
    this.tableHistory = this.db.list<AngularFireList<any>>(environment.assignmentHistoryTable.name, ref=>ref.orderByChild('date'));
  }


  ngOnInit(): void {
   this.initializeMe();
  }

  initializeMe(){
    this.dataSource = new Array<any>();
    this.historyDates = new Array<Date>();
    this.roleSubscription = this.tableRoles.valueChanges().subscribe(listRoles => {
      this.roles = listRoles as Array<RoleModel>;

      this.memberSubscription = this.tableMembers.valueChanges().subscribe(listMembers => {
        this.members = listMembers as Array<MemberModel>;

        this.historySubscription = this.tableHistory
          .snapshotChanges().pipe(map(actions =>actions.map(a => ({ key: a.key, ...a.payload.val() }))))
          .subscribe(listHistory => {
            this.listOfHistories = listHistory;

            //how many history records do we need
            this.histories = new Array();
            let history = new Array<ClubMeetingModel>();

            let totalMembers = this.members.length;
            let totalHistories = this.listOfHistories.length;

            this.numOfHistoriesNeed = totalMembers;
            if (totalHistories < this.numOfHistoriesNeed)
              this.numOfHistoriesNeed = totalHistories;

            if (this.numOfHistoriesNeed > 0) {
              for (let i = totalHistories-1; i >= totalHistories-this.numOfHistoriesNeed; i--) {
                history = new Array<ClubMeetingModel>();
                for (const [key, val] of Object.entries(this.listOfHistories[i] as Array<ClubMeetingModel>)) {
                  // if (val.key)
                  //   delete val.key;
                  if (key!='key'){
                    let result = {'key': this.listOfHistories[i].key + '/' + key, 'date': val.date,'roleId':val.roleId,'roleName': '','assignedTo': val.assignedTo,
                      'email': '', 'memberName':'', 'memo': '', 'sortIndex':0, 'timeLimit': '' };
                    history.push(result);
                  }
                  if (val.date)
                    this.historyDates.push(val.date); // this is for when add new history table, need to avoid choose these existing dates
                }
                // history.pop();
                this.histories.push(history);
                if (this.histories[0][0])
                  this.histories.sort((a, b) => new Date(b[0].date).valueOf() - new Date(a[0].date).valueOf()); // latest appear on top
              }
              // console.log(this.histories);
              this.refreshUIDataSource(this.histories);
            }
          });
        setTimeout(()=>this.isWaiting = false,200);
      });
    });
  }

  refreshUIDataSource(historyData){
    this.dataSource =[];
    historyData.forEach(history => {
      let oneSource = new MatTableDataSource(history);
      oneSource.sort = this.sort;
      this.dataSource.push(oneSource);
    });
  }


  updateHistoryTable(element){
      this.tableHistory.update(element.key,element);
  }

  openDialog(action, from, obj) {
    obj.action = action;
    obj.from = from;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '280px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isWaiting = false;
      if (result.event === 'Delete'){
        this.histories.forEach(hr =>{
          let item = hr.find(h=>h.date === result.data.date && h.assignedTo === result.data.assignedTo && h.roleId === result.data.roleId);
          const index = hr.indexOf(item);
          if (index > -1)
            hr.splice(index,1);
        });
        this.refreshUIDataSource(this.histories);
        this.tableHistory.remove(obj.key);
      }
      if (result.event === 'Add'){
        if (result.from.indexOf('from-history-')>=0){
          let whichHistory = -1;
          try{whichHistory = Number(result.from.replace('from-history-',''));} catch(ex){}
          if (whichHistory>=0){
            let historyKey = this.histories[whichHistory][0].key;
            historyKey = historyKey.substring(0,historyKey.indexOf('/'));
            this.db.database.ref('assignmentHistory/' + historyKey).push(result.data);
            this.histories[whichHistory].push(result.data);
            this.refreshUIDataSource(this.histories);
          }
        }
        if (result.from =='from-new-history'){
          // add a new history table

          let _newHistory = this.db.database.ref('assignmentHistory').push(); // this wont call to server
          let newRecord = new Array({'key':_newHistory.key,'assignedTo':0,'date':util.GetFormattedDate(result.data.date),'roleId':0,'roleName':'','email':'','memberName':'','memo':'','sortIndex':0,'timeLimit':''});

          _newHistory.set(newRecord);
          this.histories.push(newRecord);
          this.refreshUIDataSource(this.histories);


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
