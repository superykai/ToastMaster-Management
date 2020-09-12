export class MemberModel
{
  key: string;
  guid: number;
  firstName: string;
  lastName: string;
  ageLevel: number;
  canAssignRoles: string;
  canBeRoles: Array<{'roleName': string, 'sortIndex': number}>;
  email: string;
  primaryGuardian: number;
  guardian: string;
  totalWeightInHistory: number;

  constructor(obj: any = null)
  {
    if (obj != null)
    {
      Object.assign(this, obj);
    }
  }
}
