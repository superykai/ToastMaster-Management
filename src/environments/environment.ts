// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase : {
    apiKey: 'AIzaSyA0nZ8tVjk0x8VBIzmV5RnZn_sS0Z_WGC8',
    authDomain: 'toastmaster-management.firebaseapp.com',
    databaseURL: 'https://toastmaster-management.firebaseio.com',
    projectId: 'toastmaster-management',
    storageBucket: 'toastmaster-management.appspot.com',
    messagingSenderId: '24697891398',
    appId: '1:24697891398:web:993fb4e2e6b4711590b847',
    measurementId: 'G-F8TNJRSVB9'
  },
  memberTable: {
    name: '/members'
  },
  roleTable: {
    name: '/Roles'
  },
  assignmentHistoryTable: {
    name: '/assignmentHistory'
  },
  currentAssignmentTable: {
    name: '/currentAssignment'
  },
  nextAssignmentTable: {
    name: '/nextAssignment'
  },
  nextNextAssignmentTable: {
    name: '/nextNextAssignment'
  },
  fileStore: {
    name: 'RemindMe-Files'
  },
  validationEnum: {
    firstNameMax: 100,
    lastNameMax: 100
  },
  emailJS:{
    serviceId: 'service_kdn56fl',
    userId: 'user_zrIKR9gHxlunVuM48kwuH'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
