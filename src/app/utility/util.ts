import {format} from 'util';
import {AngularFireList} from "@angular/fire/database";

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

  static agendaGenerator(tableCurrent, tableNext, tableNextNext){
    let htmlAgenda ='';
    if (tableCurrent.length>0) {
      htmlAgenda += '<table border="0"><tr><td>' + tableCurrent[0].date + '  Sunday Hope Toastmaster Meeting' + '</td></tr>' +
        '<tr><td>' + 'Time: 7:00PM - 8:30PM' + '</td></tr>' +
        '<tr><td>' + 'Location: Zoom Meeting' + '</td></tr>' +
        '<tr><td>' + 'Theme:' + '</td></tr>';

      tableCurrent.forEach(m => {
        if (m.memberName.trim().length > 0) {
          if (m.roleName.toLowerCase().indexOf('toastmaster') >= 0
            || m.roleName.toLowerCase().indexOf('speaker 1') >= 0
            || m.roleName.toLowerCase().indexOf('evaluator 1') >= 0
            || m.roleName.toLowerCase().indexOf('general evaluator') >= 0) {
            htmlAgenda += '<tr><td><br/></td></tr>'
          }
          htmlAgenda += '<tr><td>' + m.roleName + ': ' + m.memberName + '</td></tr>'
        }
      });
      htmlAgenda += '</table><br/>';
      htmlAgenda += '<table border="0"><tr><td>Join Zoom Meeting</td></tr>'+
        '<tr><td><a href="https://zoom.us/j/615410090?pwd=amN5VzVIV2phSld2cTNIdUdBeW9rdz09">https://zoom.us/j/615410090?pwd=amN5VzVIV2phSld2cTNIdUdBeW9rdz09</a></td></tr>' +
        '<tr><td><br/></td></tr>' +
        '<tr><td>Meeting ID: 615 410 090</td></tr>' +
        '<tr><td>Password: hope2020</td></tr></table><br/>';
    }

    if (tableNext.length > 0){
      htmlAgenda += '<table border="0"><tr><td>' + tableNext[0].date + '  Speakers' + '</td></tr>';

      tableNext.forEach(m => {
        if (m.memberName.trim().length > 0) {
          htmlAgenda += '<tr><td>' + m.roleName + ': ' + m.memberName + '</td></tr>'
        }
      });
      htmlAgenda += '</table><br/>';
    }

    if (tableNextNext.length > 0){
      htmlAgenda += '<table border="0"><tr><td>' + tableNextNext[0].date + '  Speakers' + '</td></tr>';

      tableNextNext.forEach(m => {
        if (m.memberName.trim().length > 0) {
          htmlAgenda += '<tr><td>' + m.roleName + ': ' + m.memberName + '</td></tr>'
        }
      });
      htmlAgenda += '</table><br/>';
    }
      return htmlAgenda;
  }
}
