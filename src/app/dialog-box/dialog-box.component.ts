import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ClubMeetingModel} from '../models/ClubMeetingModel';


@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {

  fieldName: string;
  action: string;
  from: string;
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ClubMeetingModel) {
    console.log(data);
    this.local_data = {...data};
    this.from = this.local_data.from;
    this.fieldName = this.local_data.fieldName;
    this.action = this.local_data.action;
  }

  doAction(){
    this.dialogRef.close({event: this.action, data: this.local_data});
  }

  closeDialog(){
    this.dialogRef.close({event: 'Cancel'});
  }

}
