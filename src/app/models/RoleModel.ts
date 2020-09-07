export class RoleModel
{
  key: string;
  guid: number;
  roleName: string;
  activated: boolean;
  isSpeakerRole: boolean;
  sortIndex: number;
  weight: number;
  selected: boolean;

  constructor(obj: any = null)
  {
    if (obj != null)
    {
      Object.assign(this, obj);
    }
  }
}
