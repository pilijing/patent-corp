/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.vue' {
  import Vue from 'vue';

  declare module 'vue/types/vue' {
    interface Vue {
      // $myProperty: string;
      $loading: any;
      $msgbox: any;
      $alert: any;
      $confirm: any;
      $prompt: any;
      $notify: any;
      $message: any;
    }
  }
  export default Vue;
}
