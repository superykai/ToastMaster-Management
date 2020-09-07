export class ClubMeetingModel
{
  assignedTo:number;
  date: string;
  email: string;
  memberName:string;
  memo:string;
  roleId: number;
  roleName: string;
  sortIndex: number;
  timeLimit: string;


  constructor(obj: any = null)
  {
    if (obj != null)
    {
      Object.assign(this, obj);
    }
  }
}
