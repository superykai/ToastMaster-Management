import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss']
})
export class UploadTaskComponent implements OnInit {

  @Input() file: File;

  task: AngularFireUploadTask;

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: string;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore,
              private activedRoute: ActivatedRoute,
              public datePipe: DatePipe) { }

  ngOnInit() {
    this.startUpload();
  }

  startUpload() {

    // The storage path
    const path = `RemindMe-Storage/${Date.now()}_${this.file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, this.file);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot   = this.task.snapshotChanges().pipe(
      tap(console.log),
      // The file's download URL
      finalize( async () =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();

        const createdDate = this.datePipe.transform(`${Date.now()}`, 'MM/dd/yyyy');

        let sid = this.activedRoute.snapshot.paramMap.get('sid');
        if (sid == null) {
          sid = this.activedRoute.snapshot.queryParamMap.get('sid');
          if (sid == null && this.activedRoute.url != null) {
            sid = this.activedRoute.url.queryParamMap.get('sid');
          }
        }
        this.db.collection(environment.fileStore.name)
          .add({sid: Number(sid), file_name: this.file.name, downloadURL: this.downloadURL, path, created_date: createdDate
          });
      }),
    );
  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
