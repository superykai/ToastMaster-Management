export class FileModel
{
  id: string;
  subject_name: string;
  downloadURL: string;
  path: string;
  file_name: string;
  file_extension:string;
  sid: number;

  constructor(obj: any = null)
  {
    if (obj != null)
    {
      Object.assign(this, obj);
    }
  }
}
