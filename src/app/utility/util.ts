import {format} from 'util';

export default class Util {
  static getFileExtension(filename): string {
    const ext = /^.+\.([^.]+)$/.exec(filename);
    const res = ext == null ? '' : ext[1];

    if (res === 'pdf') {
      return '../../assets/pdf.png';

    } else if (res === 'doc' || res === 'docx') {
      return '../../assets/doc.png';

    } else if (res === 'ppt' || res === 'pptx' || res === 'pptm') {
      return '../../assets/ppt.png';

    } else if (res === 'txt') {
      return '../../assets/txt.png';

    } else if (res === 'zip') {
      return '../../assets/zip.png';

    } else if (res === 'xlsx' || res === 'xls' || res === 'csv') {
      return '../../assets/xls.png';

    } else if (res === 'png' || res === 'jpg' || res === 'bmp' || res === 'tiff') {
      return '../../assets/image.png';

    } else if (res === 'mp4' || res === 'avi' || res === 'mov' || res === 'flv' || res === 'wmv') {
      return '../../assets/video.png';

    } else {
      return '../../assets/unknown.png';

    }
  }

  static GetFormattedDate(InputDate) {

    const month = format(InputDate .getMonth() + 1);
    const day = format(InputDate .getDate());
    const year = format(InputDate .getFullYear());
    return month + '/' + day + '/' + year;
  }

  static setCookie(name: string, val: string, days: number) {
    const date = new Date();
    const value = val;

    // Set it expire in 7 days
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    // Set it
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  static getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  }


  static deleteCookie(name: string) {
    const date = new Date();

    // Set it expire in -1 days
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

    // Set it
    document.cookie = `${name}=;expires=${date.toUTCString()};path=/`;
  }
}
