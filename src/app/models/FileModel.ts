export class FileModel
{
  id: string;
  subjectName: string;
  downloadURL: string;
  path: string;
  fileName: string;
  fileExtension: string;
  sid: number;

  constructor(obj: any = null)
  {
    if (obj != null)
    {
      Object.assign(this, obj);
    }
  }
}
