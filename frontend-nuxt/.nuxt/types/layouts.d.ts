import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    admin: ComponentProps<typeof import("/app/applet/frontend-nuxt/layouts/admin.vue").default>,
    auth: ComponentProps<typeof import("/app/applet/frontend-nuxt/layouts/auth.vue").default>,
    student: ComponentProps<typeof import("/app/applet/frontend-nuxt/layouts/student.vue").default>,
    teacher: ComponentProps<typeof import("/app/applet/frontend-nuxt/layouts/teacher.vue").default>,
    workspace: ComponentProps<typeof import("/app/applet/frontend-nuxt/layouts/workspace.vue").default>,
}
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}