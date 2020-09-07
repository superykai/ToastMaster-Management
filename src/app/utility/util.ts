import {format} from "util";

export default class util {
  static getFileExtension(filename): string {
    var ext = /^.+\.([^.]+)$/.exec(filename);
    let res = ext == null ? "" : ext[1];

    if (res == "pdf") {
      return '../../assets/pdf.png';

    } else if (res == "doc" || res == 'docx') {
      return '../../assets/doc.png';

    } else if (res == "ppt" || res == 'pptx' || res == 'pptm') {
      return '../../assets/ppt.png';

    } else if (res == "txt") {
      return '../../assets/txt.png';

    } else if (res == "zip") {
      return '../../assets/zip.png';

    } else if (res == "xlsx" || res == 'xls' || res=='csv') {
      return '../../assets/xls.png';

    } else if (res == "png" || res == "jpg" || res == "bmp" || res == 'tiff') {
      return '../../assets/image.png';

    } else if (res == "mp4" || res == "avi" || res == "mov" || res == "flv" || res == "wmv") {
      return '../../assets/video.png';

    } else {
      return '../../assets/unknown.png';

    }
  }

  static GetFormattedDate(InputDate) {

    var month = format(InputDate .getMonth() + 1);
    var day = format(InputDate .getDate());
    var year = format(InputDate .getFullYear());
    return month + "/" + day + "/" + year;
  }
}
