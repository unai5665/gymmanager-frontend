<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { getDashboard, markAttendance } from '../../services/dashboard'

const { t } = useI18n()
const auth = useAuthStore()

const data    = ref(null)
const loading = ref(true)
const error   = ref('')
const marking = ref(false)
const markError = ref('')

const userName = computed(() => auth.user?.nombre ?? '')

async function load() {
  loading.value = true
  error.value   = ''
  try {
    data.value = await getDashboard()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleMark() {
  marking.value   = true
  markError.value = ''
  try {
    const res = await markAttendance()
    data.value.estado       = 'asistio'
    data.value.puede_marcar = false
    if (res.racha) {
      data.value.racha_actual = res.racha.racha_actual
    }
  } catch (e) {
    markError.value = e.message
  } finally {
    marking.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="attendance-page">
    <div v-if="loading" class="dashboard-loading"><span class="spinner" /></div>

    <template v-else-if="data">
      <p class="attendance-greeting">{{ t('dashboard.client.greeting', { name: userName }) }}</p>

      <!-- Training day – pending -->
      <div v-if="data.dia_hoy && !data.es_descanso && data.puede_marcar" class="attendance-card">
        <p class="attendance-question">{{ t('dashboard.client.attendanceQuestion') }}</p>
        <button class="btn-attend" :disabled="marking" @click="handleMark">
          {{ marking ? t('common.loading') : t('dashboard.client.markButton') }}
        </button>
        <p v-if="markError" class="form-error" style="margin-top:4px">{{ markError }}</p>
      </div>

      <!-- Already marked -->
      <div v-else-if="data.estado === 'asistio'" class="attendance-card attendance-card--done">
        <span class="attendance-check">✓</span>
        <p class="attendance-done-text">{{ t('dashboard.client.alreadyMarked') }}</p>
      </div>

      <!-- Missed -->
      <div v-else-if="data.estado === 'falto'" class="attendance-card attendance-card--missed">
        <p>{{ t('dashboard.client.missedDay') }}</p>
      </div>

      <!-- Rest day -->
      <div v-else-if="data.es_descanso" class="attendance-card attendance-card--rest">
        <span class="rest-icon">💤</span>
        <p>{{ t('dashboard.client.restDay') }}</p>
      </div>

      <!-- No routine configured -->
      <div v-else class="attendance-card attendance-card--muted">
        <p>{{ t('dashboard.client.noRoutine') }}</p>
      </div>
    </template>

    <p v-if="error" class="form-error" style="margin-top:24px">{{ error }}</p>
  </div>
</template>
