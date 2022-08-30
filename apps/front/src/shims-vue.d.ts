/* eslint-disable */

/// <reference types="vite/client" />
/// <reference types="vue/ref-macros" />

// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $env: Record<string, unknown>;
  }
}

export {}  // Important! See note.

// declare module "pinia" {
  //   export interface PiniaCustomProperties {
    //     router: Router;
    //   }
    // }

import 'pinia';
import type { Router } from "vue-router"; // is it correct ?
declare module 'pinia' {
  export interface PiniaCustomProperties {
      router: Router
  }
}


// declare module 'pinia' {
//   export interface PiniaCustomProperties {
//     // by using a setter we can allow both strings and refs
//     set hello(value: string)
//     get hello(): string

//     // you can define simpler values too
//     simpleNumber: number
//   }
// }
