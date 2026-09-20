<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Si ya tiene clave: mostrar estado y acciones -->
    <div v-if="tutorStore.hasKey" class="space-y-3">
      <div class="flex items-center gap-2 p-3 rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30">
        <span aria-hidden="true">🔑</span>
        <div class="text-xs">
          <p class="font-semibold text-semantico-pasa">Clave configurada</p>
          <p class="text-base-texto-secundario">termina en <code class="font-codigo">••••{{ tutorStore.last4 }}</code></p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="showForm = true"
          class="borde-afordancia flex-1 py-2 rounded-md text-xs font-semibold text-base-texto-primario hover:text-acento-ambar-fuerte transition-colors"
          :aria-label="'Cambiar clave de Google AI Studio'"
        >
          Cambiar
        </button>
        <button
          @click="handleDelete"
          :disabled="isDeleting"
          class="borde-afordancia flex-1 py-2 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10 transition-colors disabled:opacity-50"
          :aria-label="'Quitar clave de Google AI Studio'"
        >
          {{ isDeleting ? 'Eliminando…' : 'Quitar mi clave' }}
        </button>
      </div>

      <!-- Formulario de cambio -->
      <form v-if="showForm" @submit.prevent="handleSave" class="space-y-3 pt-2 border-t border-base-borde-sutil">
        <KeyField v-model="apiKeyInput" :disabled="isSaving" />
        <button
          type="submit"
          :disabled="!apiKeyInput.trim() || isSaving"
          class="w-full py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-50 hover:bg-acento-ambar transition-colors"
        >
          {{ isSaving ? 'Verificando…' : 'Guardar y verificar' }}
        </button>
        <ErrorMsg :text="saveError" />
      </form>
    </div>

    <!-- Sin clave: instrucciones + formulario -->
    <div v-else class="space-y-4">
      <!-- Pasos para conseguir la clave -->
      <div>
        <p class="text-xs font-bold text-base-texto-primario mb-2">
          Clave de Google AI Studio — para usar el Tutor
        </p>
        <ol class="text-[11px] text-base-texto-secundario space-y-1.5 list-decimal pl-4">
          <li>
            Abre Google AI Studio:
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              class="text-acento-ambar-fuerte underline"
            >https://aistudio.google.com/apikey</a>
          </li>
          <li>Inicia sesión con tu cuenta de Google (la misma de tu correo institucional o personal).</li>
          <li>Pulsa <strong>«Create API key»</strong> (Crear clave de API).</li>
          <li>Copia la clave que aparece y pégala aquí abajo.</li>
        </ol>
        <p class="text-[10px] text-base-texto-secundario mt-2 italic">
          No requiere tarjeta de crédito. La capa gratuita tiene un límite por minuto y por día
          — si lo alcanzas, el Tutor te lo dirá.
        </p>
      </div>

      <!-- Campo de la clave + botón guardar -->
      <form @submit.prevent="handleSave" class="space-y-3">
        <KeyField v-model="apiKeyInput" :disabled="isSaving" />
        <button
          type="submit"
          :disabled="!apiKeyInput.trim() || isSaving"
          class="w-full py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-50 hover:bg-acento-ambar transition-colors"
        >
          {{ isSaving ? 'Verificando…' : 'Guardar y verificar' }}
        </button>
        <ErrorMsg :text="saveError" />
      </form>

      <!-- Aviso de privacidad (§19.3) -->
      <PrivacyNotice />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTutorStore } from '~/stores/tutor'

const tutorStore = useTutorStore()

const apiKeyInput = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const saveError = ref('')
const showForm = ref(false)

async function handleSave() {
  if (!apiKeyInput.value.trim()) return
  isSaving.value = true
  saveError.value = ''
  const result = await tutorStore.saveApiKey(apiKeyInput.value.trim())
  isSaving.value = false
  if (!result.ok) {
    saveError.value = result.error || 'Error al guardar la clave.'
  } else {
    apiKeyInput.value = ''
    showForm.value = false
  }
}

async function handleDelete() {
  if (!confirm('¿Seguro que quieres eliminar tu clave? El Tutor dejará de funcionar hasta que configures una nueva.')) return
  isDeleting.value = true
  const result = await tutorStore.deleteApiKey()
  isDeleting.value = false
  if (!result.ok) {
    saveError.value = result.error || 'No se pudo eliminar la clave.'
  }
}
</script>

<!-- Sub-componentes inline (evitar archivos separados para piezas pequeñas) -->
<script lang="ts">
// KeyField — campo de contraseña con toggle de visibilidad
const KeyField = defineComponent({
  props: { modelValue: String, disabled: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const show = ref(false)
    return () =>
      h('div', { class: 'relative' }, [
        h('label', { for: 'tutor-api-key', class: 'block text-[11px] font-semibold text-base-texto-primario mb-1' }, 'Tu clave de Google AI Studio'),
        h('input', {
          id: 'tutor-api-key',
          type: show.value ? 'text' : 'password',
          value: props.modelValue,
          onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
          disabled: props.disabled,
          autocomplete: 'off',
          placeholder: 'AIzaSy…',
          'aria-label': 'Clave de Google AI Studio',
          class: 'w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none pr-10'
        }),
        h('button', {
          type: 'button',
          onClick: () => { show.value = !show.value },
          'aria-label': show.value ? 'Ocultar clave' : 'Mostrar clave',
          class: 'absolute right-2 top-7 text-base-texto-secundario hover:text-base-texto-primario text-[11px]'
        }, show.value ? '🙈' : '👁️')
      ])
  }
})

// ErrorMsg — muestra texto de error con role=alert
const ErrorMsg = defineComponent({
  props: { text: String },
  setup(props) {
    return () => props.text
      ? h('p', {
          role: 'alert',
          class: 'text-[11px] text-semantico-falla bg-semantico-falla/10 border border-semantico-falla/30 rounded p-2'
        }, props.text)
      : null
  }
})

// PrivacyNotice — aviso de privacidad obligatorio §19.3
const PrivacyNotice = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'text-[10px] text-base-texto-secundario p-2 bg-base-bg-secundario rounded border border-base-borde-sutil' }, [
        h('p', { class: 'font-semibold mb-1' }, '🔒 Privacidad'),
        h('p', {}, 'Tu clave se guarda cifrada y solo sirve para hablar con el Tutor; nadie del equipo puede verla. Las preguntas que le haces al Tutor (y el código que tengas abierto en el editor) se envían a Google usando '),
        h('strong', {}, 'tu'),
        h('span', {}, ' cuenta. En la capa gratuita, Google puede usar ese contenido para mejorar sus productos: no escribas datos personales ni contraseñas en el chat.')
      ])
  }
})
</script>
