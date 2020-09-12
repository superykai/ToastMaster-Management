import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import {MemberModel} from '../models/MemberModel';
import {RoleModel} from '../models/RoleModel';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {

  submitted = false;
  memberForm: FormGroup;

  guid: number;
  strGuid: string;
  member = new MemberModel();

  members: Array<MemberModel>;
  tableMember: AngularFireList<any>;

  roles: Array<RoleModel>;
  tableRole: AngularFireList<any>;

  memberSubscription: Subscription;
  roleSubscription: Subscription;

  constructor(private db: AngularFireDatabase, private formBuilder: FormBuilder, private router: Router,
              private activedRoute: ActivatedRoute) {
    this.tableMember = this.db.list(environment.memberTable.name);
    this.tableRole = this.db.list(environment.roleTable.name);
  }

  invalidFirstName()
  {
    return (this.submitted && this.memberForm.controls.firstName.errors != null);
  }

  invalidLastName()
  {
    return (this.submitted && this.memberForm.controls.lastName.errors != null);
  }

  invalidEmail()
  {
    return (this.submitted && this.memberForm.controls.email.errors != null);
  }

  invalidGuardian()
  {
    return (this.submitted && this.memberForm.controls.guardian.errors != null);
  }

  invalidAge()
  {
    return (this.submitted && this.memberForm.controls.ageLevel.errors != null);
  }


  onRoleChange(event){
    const selectedVals: string[] = [];
    (event.selectedOptions.selected).forEach(s => {selectedVals.push(s._value); });
    this.member.canAssignRoles = selectedVals.toString();
    // console.log(this._member.canAssignRoles);
  }

  changeGuardian(value){
    this.member.primaryGuardian = Number(value);
  }

  changeFirstName(value){
    this.member.firstName = value;
  }

  changeLastName(value){
    this.member.lastName = value;
  }

  changeEmail(value){
    this.member.email = value;
  }

  changeAge(value){
    this.member.ageLevel = Number(value);
  }

  ngOnInit() {
    this.strGuid = this.activedRoute.snapshot.paramMap.get('guid');

    this.roleSubscription = this.tableRole.valueChanges().subscribe(roleList => {
      this.roles = roleList as Array<RoleModel>;
      this.roles.sort((a, b) => a.sortIndex - b.sortIndex);

      this.memberSubscription = this.tableMember.snapshotChanges().pipe(
        map(actions =>
          actions.map(a => ({key: a.key, ...a.payload.val()}))
        )
      ).subscribe(list => {
        this.members = list as Array<MemberModel>;
        if (this.strGuid != null && !isNaN(Number(this.strGuid))) {
          this.guid = Number(this.strGuid);
          this.member = this.members.filter(a => a.guid === this.guid)[0];
          this.roles.forEach(r => {
            if (this.member.canAssignRoles.indexOf(r.guid.toString()) >= 0) {
              r.selected = true;
            }
            else {
              r.selected = false;
            }
          });
          this.memberForm.setValue({
            firstName: this.member.firstName,
            lastName: this.member.lastName,
            email: this.member.email,
            guardian: this.member.primaryGuardian,
            ageLevel: Number(this.member.ageLevel),
            roles: this.roles
          });
        }
        else{
          this.strGuid = null;
        }
      });
    });


    this.memberForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(environment.validationEnum.firstNameMax)]],
      lastName: ['', [Validators.required, Validators.maxLength(environment.validationEnum.lastNameMax)]],
      email: [new FormControl('').value],
      guardian: ['', [Validators.required]],
      ageLevel: ['', [Validators.required]],
      roles: [new FormControl('').value]
    });
  }

  onSubmit()
  {
    this.submitted = true;

    if (this.memberForm.invalid === true)
    {
      return;
    }
    else
    {
      if (this.strGuid == null) {
        // new entry, new member
        this.guid = new Date().valueOf();
        // const data: MemberModel = Object.assign(this.memberForm.value);
        this.tableMember.push({
          guid: Number(this.guid),
          firstName: this.member.firstName,
          lastName: this.member.lastName,
          ageLevel: this.member.ageLevel,
          canAssignRoles: this.member.canAssignRoles,
          primaryGuardian: this.member.primaryGuardian,
          email: this.member.email ? this.member.email : ''
        });
      }
      else{
        // existing member
        this.tableMember.update(this.member.key, {
          guid: Number(this.guid),
          firstName: this.member.firstName,
          lastName: this.member.lastName,
          ageLevel: this.member.ageLevel,
          canAssignRoles: this.member.canAssignRoles,
          primaryGuardian: this.member.primaryGuardian,
          email: this.member.email
        });
      }

      // const data: SubjectModel = Object.assign({sid: Number(this.sid)}, this.subjectForm.value);
      //
      // data.first_duration =  Number(data.first_duration);
      // data.second_duration =  Number(data.second_duration);
      // data.third_duration =  Number(data.third_duration);
      // data.start_date = this.datePipe.transform(data.start_date, 'MM/dd/yyyy');
      //
      // this.db.list(environment.subjectTable.name).push(data);

      this.router.navigateByUrl('/members');
    }
  }

  ngOnDestroy(): void {
    if (this.memberSubscription) {
      this.memberSubscription.unsubscribe();
    }
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }
}

