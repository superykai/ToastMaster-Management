import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {ActivatedRoute, Router } from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {MatTableDataSource} from '@angular/material/table';
import {ClubMeetingModel} from "../models/ClubMeetingModel";
import { AngularFireDatabase} from '@angular/fire/database';
import {environment} from '../../environments/environment';
import { AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import {Observable, Subscription} from 'rxjs';
import {DialogBoxComponent} from '../dialog-box/dialog-box.component';
import {FileModel} from '../models/FileModel';
import {map} from 'rxjs/operators';
import util from '../utility/util';

@Component({
  selector: 'app-manage-all-files',
  templateUrl: './manage-all-files.component.html',
  styleUrls: ['./manage-all-files.component.css']
})
export class ManageAllFilesComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  fileSubscription: Subscription;
  subjectSubscription: Subscription;
  clubMeetings: ClubMeetingModel[];
  clubMeeting: ClubMeetingModel;
  observableFiles: Observable<FileModel[]>;
  files: Array<FileModel>;
  sid: string;
  fileCollection: AngularFirestoreCollection<any>;

  constructor(private db: AngularFireDatabase, private activatedRoute: ActivatedRoute, private router: Router,
              public dialog: MatDialog,private dbStore: AngularFirestore, private storage: AngularFireStorage) {
    this.sid = activatedRoute.snapshot.queryParamMap.get('sid');

    this.fileCollection = this.dbStore.collection<AngularFirestoreCollection<any>>(environment.fileStore.name);
  }

  displayedColumns: string[] = ['subject_name','file_name', 'created_date', 'action'];

  dataSource: any;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  openDialog(action, from, obj) {
    obj.action = action;
    obj.from = from;
    let width = '280px';
    let height = '200px';

    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: width,
      height: height,
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Delete'){
        this.deleteRowData(result.data);
      }
    });
  }

  changeSubject(value){
    this.dataSource = new MatTableDataSource(this.files);
    // this.files.forEach(item => {
    //   let sub = this.clubMeetings.filter(x => x.sid === item.sid)[0];
    //   if (sub.subject_memo.length>25)
    //     item.subject_name = sub.subject_name + " - " + sub.subject_memo.substring(0,24) + " ... ";
    //   else
    //     item.subject_name = sub.subject_name + " - " + sub.subject_memo;
    //   //file extension
    //   item.file_extension = util.getFileExtension(item.file_name);
    // });

    if (value!=-1){
      this.dataSource = new MatTableDataSource(this.files.filter(file => file.sid === Number(value)));

      this.sid = this.activatedRoute.snapshot.queryParamMap.get('sid');
      if ( this.sid==null || this.sid == ""){
        const urlTree = this.router.createUrlTree([], {
          queryParams: { sid: value },
          queryParamsHandling: "merge",
          preserveFragment: true });
        this.activatedRoute.url = urlTree;
        this.sid = value;
      }
      // this.clubMeeting = this.clubMeetings.filter(s => s.sid === Number(this.sid))[0];
    }
    else{
      this.clubMeeting = null;
    }

    this.dataSource.sort = this.sort;
  }


  deleteRowData(row_obj){
    this.fileCollection.doc(row_obj.id).delete();
    this.storage.storage.refFromURL(row_obj.downloadURL).delete();
    //const folderPath = `RemindMe-Storage`;

    // this.storage.storage.ref(folderPath).listAll().then(data => {
    //   data.items.forEach(item => {
    //     this.storage.storage.ref(item['location']['path']).delete()
    //   });
    // })
  }

  ngOnInit(): void {
    this.files = new Array<FileModel>();

    this.observableFiles = this.fileCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as FileModel;
          data.id = a.payload.doc.id;
          return data;
        })
      })
    );
    // this.subjectSubscription = this.db.list<SubjectModel>(environment.subjectTable.name).valueChanges().subscribe(subjects => {
    //   this.clubMeetings = (subjects as SubjectModel[]);
    //   this.clubMeeting = this.clubMeetings.filter(s => s.sid === Number(this.sid))[0];
    //
    //   this.observableFiles.forEach(file => {
    //     this.files = file;
    //
    //     let ddl = <HTMLSelectElement>document.getElementById('ddlSubjects');
    //     if (ddl != null){
    //       this.changeSubject(ddl.options[ddl.selectedIndex].value);
    //     }
    //   });
    // });
  }

  ngOnDestroy(): void {
    if (this.subjectSubscription)
      this.subjectSubscription.unsubscribe();
    if (this.fileSubscription)
      this.fileSubscription.unsubscribe();
  }
}

