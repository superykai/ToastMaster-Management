import {format} from 'util';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import {environment} from "../../environments/environment";

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
        '<tr><td>' + 'Time: 3:30PM - 5:00PM' + '</td></tr>' +
        '<tr><td>' + 'Location: GPCCC Chinese School B205' + '</td></tr>' +
        '<tr><td>' + 'Theme:' + '</td></tr>';

      tableCurrent.forEach(m => {
        if (m.memberName.trim().length > 0) {
          if (m.roleName.toLowerCase().indexOf('toastmaster') >= 0
            || m.roleName.toLowerCase().indexOf('speaker 1') >= 0
            || m.roleName.toLowerCase().indexOf('evaluator 1') >= 0
            || m.roleName.toLowerCase().indexOf('general evaluator') >= 0) {
            htmlAgenda += '<tr><td><br/></td></tr>';
          }
          htmlAgenda += '<tr><td>' + m.roleName + ': ' + m.memberName + '</td></tr>';
        }
      });
      htmlAgenda += '</table><br/>';
      // htmlAgenda += '<table border="0"><tr><td>Join Zoom Meeting</td></tr>' +
      //   '<tr><td><a href="https://us04web.zoom.us/j/7292733122?pwd=SDh3SmFwWFVpUHFRVUlISng1b3ZXQT09">https://us04web.zoom.us/j/7292733122?pwd=SDh3SmFwWFVpUHFRVUlISng1b3ZXQT09</a></td></tr>' +
      //   '<tr><td><br/></td></tr>' +
      //   '<tr><td>Meeting ID: 729 273 3122</td></tr>' +
      //   '<tr><td>Password: hope2021</td></tr></table><br/>';
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

  static sendEmail(role, name, email, date, isSpeakerRole){
    const serviceId = environment.emailJS.serviceId;
    const userId = environment.emailJS.userId;

    let html = `
        <h3>You have a ${role} role at ${date}.</h3>
        <p>Please <a href="https://toastmaster-management.web.app">CLICK HERE</a> to check all roles in that meeting.</p>
        <p>If you need instruction of how to perform your functional role, <a href="https://drive.google.com/file/d/13vtYsSCPDfJmhkhmQwtijDk6Hp7t15i0/view?usp=sharing">CLICK HERE</a> to
        check functionary role scripts.</p>
        <p><img src="https://upload.wikimedia.org/wikipedia/en/0/05/Toastmasters_2011.png" width="168" height="147"/></p>`
    if (isSpeakerRole){
      html = `
        <h3>You have a ${role} role at ${date}.</h3>
        <p>Please <a href="https://toastmaster-management.web.app">CLICK HERE</a> to provide your speech time limit and speech intro, your default time limit is 5 - 7 mins.</p>
        <p>If you need instruction of how to perform your functional role, <a href="https://drive.google.com/file/d/13vtYsSCPDfJmhkhmQwtijDk6Hp7t15i0/view?usp=sharing">CLICK HERE</a> to
        check functionary role scripts.</p>
        <p><img src="https://upload.wikimedia.org/wikipedia/en/0/05/Toastmasters_2011.png" width="168" height="147"/></p>`
    }
    let templateParams = {
      from_name: 'Hope Toastmaster',
      to: email,
      role: role,
      date : date,
      to_name: name,
      html: html
    };


    emailjs.init(userId);

    emailjs.send(serviceId, 'template_for_speaker', templateParams)
      .then((result: EmailJSResponseStatus) => {
        console.log(result.text);
      }, (error) => {
        console.log(error.text);
      });
  }

  // async delay(ms: number) {
  //   await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("fired"));
  // }
}
