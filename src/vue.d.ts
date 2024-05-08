/**
 * 因为 vuex 不提供开箱即用的类型定义，所以我们需要自己定义
 */
// vuex.d.ts
import { ComponentCustomProperties } from '@/vue'
import { Store } from 'vuex'

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
windowWidth: number
[x: string]: number
    orbital
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}
