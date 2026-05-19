<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Modal from '../../components/Modal.vue'
import { getUsuario } from '../../services/usuarios'
import {
  getRutina, updateRutina, deleteRutina,
  getGruposMusculares, getEjercicios,
} from '../../services/rutinas'
import { getAsistencias } from '../../services/asistencias'
import {
  getFavoritas, aplicarFavorita,
} from '../../services/rutinasFavoritas'

const { t, te, locale } = useI18n()
const route  = useRoute()
const router = useRouter()

const clienteId = route.params.clienteId

// ── i18n helpers ─────────────────────────────────────────────────────────────

function exName(nombre) {
  const key = `exercises.${nombre}`
  return te(key) ? t(key) : nombre
}

function mgName(nombre) {
  const key = `muscleGroups.${nombre}`
  return te(key) ? t(key) : nombre
}

function localeCode() {
  return locale.value === 'es' ? 'es-ES' : 'en-US'
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const DAY_MS = 86400000

function mondayOf(d = new Date()) {
  const date = new Date(d)
  const dow  = date.getDay() === 0 ? 7 : date.getDay()
  date.setDate(date.getDate() - dow + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

function toISO(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Core state ────────────────────────────────────────────────────────────────

const currentDate = ref(new Date())

// ── Client info ───────────────────────────────────────────────────────────────

const clientName    = ref('')
const clientLoading = ref(false)

// ── Weekly state ──────────────────────────────────────────────────────────────

const rutina         = ref(null)
const weekAttendance = ref([])
const loading        = ref(false)
const loadError      = ref('')
const conflictError  = ref('')
const editMode       = ref(false)
const editedDias     = ref(null)
const saving         = ref(false)
const saveError      = ref('')

// ── Exercise catalog ──────────────────────────────────────────────────────────

const gruposMusculares  = ref([])
const ejercicios        = ref([])
const showExerciseModal = ref(false)
const addingToDia       = ref(-1)
const exerciseForm      = ref({
  grupo_muscular_id: '', ejercicio_id: '',
  series: 3, repeticiones: 12, peso: '', notas: '',
})

// ── Favorites state ───────────────────────────────────────────────────────────

const favorites         = ref([])
const showApplyFavModal = ref(false)
const applyFavId        = ref('')
const applyTarget       = ref('week')
const applyWeeksCount   = ref(2)
const applyMonth        = ref('')
const applyError        = ref('')
const applySuccess      = ref('')
const applyConflictWarn = ref('')
const applyLoading      = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────────

const todayISO = toISO(new Date())

const weekStart = computed(() => mondayOf(currentDate.value))

const isCurrentWeek = computed(() =>
  toISO(mondayOf(new Date())) === toISO(weekStart.value)
)

const periodLabel = computed(() => {
  const lc  = localeCode()
  const end = new Date(weekStart.value.getTime() + 6 * DAY_MS)
  const from = weekStart.value.getDate()
  const to   = end.toLocaleDateString(lc, { day: 'numeric', month: 'long', year: 'numeric' })
  return `${from} – ${to}`
})

const dayHeaders = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value.getTime() + i * DAY_MS)
    return {
      short: d.toLocaleDateString(localeCode(), { weekday: 'short' }).replace('.', ''),
      date:  d.getDate(),
      iso:   toISO(d),
    }
  })
)

const displayDias = computed(() =>
  editMode.value ? (editedDias.value ?? []) : (rutina.value?.dias ?? [])
)

const filteredEjercicios = computed(() =>
  ejercicios.value.filter(e =>
    String(e.grupo_muscular_id) === String(exerciseForm.value.grupo_muscular_id)
  )
)

const gruposTraducidos = computed(() =>
  gruposMusculares.value.map(g => ({
    id:    g.id,
    label: mgName(g.nombre),
  }))
)

const grupoMusPorId = computed(() =>
  Object.fromEntries(gruposMusculares.value.map(g => [g.id, mgName(g.nombre)]))
)

const weekAttendanceMap = computed(() => {
  const map = {}
  for (const a of weekAttendance.value) map[a.fecha_asistencia] = a.asistio
  return map
})

// ── Navigation ────────────────────────────────────────────────────────────────

function prevWeek() {
  currentDate.value = new Date(currentDate.value.getTime() - 7 * DAY_MS)
}

function nextWeek() {
  currentDate.value = new Date(currentDate.value.getTime() + 7 * DAY_MS)
}

function goToCurrentWeek() { currentDate.value = new Date() }

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadWeek() {
  loading.value = true; loadError.value = ''; conflictError.value = ''
  try {
    const monday = weekStart.value
    const sunday = new Date(monday.getTime() + 6 * DAY_MS)
    const [rutinaData, asistData] = await Promise.all([
      getRutina(toISO(monday), clienteId),
      getAsistencias({ desde: toISO(monday), hasta: toISO(sunday), per_page: 7, cliente_id: clienteId }),
    ])
    rutina.value         = rutinaData
    weekAttendance.value = asistData.data ?? []
  } catch (e) {
    loadError.value = e.message
  }
  loading.value = false
}

watch(currentDate, () => {
  if (editMode.value) exitEdit()
  loadWeek()
})

// ── Edit mode ─────────────────────────────────────────────────────────────────

function enterEdit() {
  editedDias.value = (rutina.value?.dias ?? []).map(dia => ({
    ...dia,
    ejercicios: dia.ejercicios.map(ej => ({ ...ej })),
  }))
  saveError.value = ''; conflictError.value = ''
  editMode.value  = true
}

function exitEdit() {
  editMode.value   = false
  editedDias.value = null
  saveError.value  = ''
}

async function saveEdit() {
  saving.value = true; saveError.value = ''; conflictError.value = ''
  try {
    const dias = editedDias.value.map(dia => ({
      id:          dia.id,
      es_descanso: dia.es_descanso,
      ejercicios:  dia.ejercicios.map((ej, idx) => ({
        ejercicio_id:  ej.ejercicio_id ?? ej.ejercicio?.id,
        series:        Number(ej.series)       || null,
        repeticiones:  Number(ej.repeticiones) || null,
        peso:          ej.peso ? Number(ej.peso) : null,
        notas:         ej.notas || null,
        orden:         idx,
      })),
    }))
    await updateRutina(rutina.value.id, dias)
    await loadWeek()
    exitEdit()
  } catch (e) {
    if (e.message?.includes('otro entrenador') || e.message?.includes('another trainer')) {
      conflictError.value = t('clients.conflictError')
      exitEdit()
    } else {
      saveError.value = e.message
    }
  }
  saving.value = false
}

async function handleDelete() {
  if (!confirm(t('routine.deleteConfirm'))) return
  try {
    await deleteRutina(rutina.value.id)
    await loadWeek()
  } catch (e) {
    loadError.value = e.message
  }
}

function toggleRest(diaIdx) {
  if (!editMode.value) return
  const dia = editedDias.value[diaIdx]
  dia.es_descanso = !dia.es_descanso
  if (dia.es_descanso) dia.ejercicios = []
}

// ── Exercise modal ────────────────────────────────────────────────────────────

function openExerciseModal(diaIdx) {
  addingToDia.value  = diaIdx
  exerciseForm.value = { grupo_muscular_id: '', ejercicio_id: '', series: 3, repeticiones: 12, peso: '', notas: '' }
  showExerciseModal.value = true
}

function confirmAddExercise() {
  if (!exerciseForm.value.ejercicio_id) return
  const ej = ejercicios.value.find(e => e.id == exerciseForm.value.ejercicio_id)
  if (!ej) return
  editedDias.value[addingToDia.value].ejercicios.push({
    ejercicio_id:  ej.id,
    ejercicio:     ej,
    series:        exerciseForm.value.series       || null,
    repeticiones:  exerciseForm.value.repeticiones || null,
    peso:          exerciseForm.value.peso         || null,
    notas:         exerciseForm.value.notas        || null,
  })
  showExerciseModal.value = false
}

function removeExercise(diaIdx, ejIdx) {
  editedDias.value[diaIdx].ejercicios.splice(ejIdx, 1)
}

// ── Apply favorite ────────────────────────────────────────────────────────────

function openApplyFavModal() {
  applyFavId.value      = favorites.value[0]?.id ?? ''
  applyTarget.value     = 'week'
  applyWeeksCount.value = 2
  applyMonth.value      = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}`
  applyError.value      = ''
  applySuccess.value    = ''
  applyConflictWarn.value = ''
  showApplyFavModal.value = true
}

async function confirmApplyFavorite() {
  if (!applyFavId.value) return
  applyLoading.value = true; applyError.value = ''; applySuccess.value = ''; applyConflictWarn.value = ''
  try {
    const monday = mondayOf(currentDate.value)
    let semanas = []

    if (applyTarget.value === 'week') {
      semanas = [toISO(monday)]
    } else if (applyTarget.value === 'weeks') {
      for (let i = 0; i < applyWeeksCount.value; i++) {
        semanas.push(toISO(new Date(monday.getTime() + i * 7 * DAY_MS)))
      }
    } else {
      const [y, m]  = applyMonth.value.split('-').map(Number)
      const first   = new Date(y, m - 1, 1)
      const last    = new Date(y, m, 0)
      let cur       = mondayOf(first)
      while (cur <= last) {
        semanas.push(toISO(cur))
        cur = new Date(cur.getTime() + 7 * DAY_MS)
      }
    }

    const result = await aplicarFavorita(applyFavId.value, semanas, clienteId)
    applySuccess.value = t('routine.applySuccess', { n: result.aplicadas })
    if (result.conflictos > 0) {
      applyConflictWarn.value = t('clients.applyConflict', { n: result.conflictos })
    }
    await loadWeek()
  } catch (e) {
    applyError.value = e.message
  }
  applyLoading.value = false
}

// ── Attendance dot helper ─────────────────────────────────────────────────────

function attDotClass(iso, map) {
  if (iso in map) return map[iso] ? 'att-dot--attended' : 'att-dot--missed'
  if (iso > todayISO) return 'att-dot--future'
  return 'att-dot--nodata'
}

function isDayLocked(diaIdx) {
  const iso = dayHeaders.value[diaIdx]?.iso
  return iso ? iso in weekAttendanceMap.value : false
}

// ── Mount ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  clientLoading.value = true
  try {
    const user = await getUsuario(clienteId)
    clientName.value = `${user.nombre} ${user.apellido}`
  } catch {}
  clientLoading.value = false

  await loadWeek()
  ;[gruposMusculares.value, ejercicios.value, favorites.value] = await Promise.all([
    getGruposMusculares(),
    getEjercicios(),
    getFavoritas(),
  ])
})
</script>

<template>
  <div class="page">

    <!-- ── Page header ──────────────────────────────────────────────────────── -->
    <div class="routine-page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn-secondary btn-sm" @click="router.push('/trainer/clients')">
          ← {{ t('clients.backToClients') }}
        </button>
        <h1 class="page-title" style="margin:0">
          {{ t('clients.editingRoutineOf') }}
          <span v-if="clientLoading" class="spinner" style="width:14px;height:14px;display:inline-block" />
          <span v-else>{{ clientName }}</span>
        </h1>
      </div>
    </div>

    <!-- ── Conflict error banner ─────────────────────────────────────────────── -->
    <div v-if="conflictError" class="conflict-banner">
      {{ conflictError }}
    </div>

    <!-- ── Period navigation ─────────────────────────────────────────────────── -->
    <div class="routine-nav-header">
      <button class="routine-nav-btn" @click="prevWeek">‹</button>
      <span class="routine-period-label">{{ periodLabel }}</span>
      <button class="routine-nav-btn" @click="nextWeek">›</button>
      <button
        v-if="!isCurrentWeek"
        class="btn-secondary btn-sm"
        style="margin-left:6px"
        @click="goToCurrentWeek"
      >
        {{ t('routine.goToday') }}
      </button>
    </div>

    <p v-if="loadError" class="form-error" style="margin-bottom:12px">{{ loadError }}</p>

    <!-- ── Weekly grid ────────────────────────────────────────────────────────── -->
    <div v-if="loading" class="dashboard-loading"><span class="spinner" /></div>

    <div v-else-if="rutina" class="routine-grid-wrap">
      <div class="routine-grid">
        <div
          v-for="(dia, diaIdx) in displayDias"
          :key="dia.id"
          class="routine-day"
          :class="{
            'routine-day--rest':   dia.es_descanso,
            'routine-day--today':  dayHeaders[diaIdx]?.iso === todayISO,
            'routine-day--locked': editMode && isDayLocked(diaIdx),
          }"
        >
          <!-- Day header -->
          <div class="routine-day-header">
            <div class="routine-day-name">{{ dayHeaders[diaIdx]?.short }}</div>
            <div class="routine-day-date">{{ dayHeaders[diaIdx]?.date }}</div>
            <span
              v-if="editMode && isDayLocked(diaIdx)"
              class="day-lock-icon"
              :title="t('routine.lockedDay')"
            >🔒</span>
            <span
              v-else-if="!dia.es_descanso"
              class="att-dot"
              :class="attDotClass(dayHeaders[diaIdx]?.iso, weekAttendanceMap)"
              :title="weekAttendanceMap[dayHeaders[diaIdx]?.iso] === true
                ? t('routine.attended')
                : weekAttendanceMap[dayHeaders[diaIdx]?.iso] === false
                  ? t('routine.missed')
                  : ''"
            />
          </div>

          <!-- Training / Rest badge -->
          <div
            class="routine-day-badge"
            :class="dia.es_descanso ? 'routine-day-badge--rest' : 'routine-day-badge--training'"
            :style="editMode && !isDayLocked(diaIdx) ? 'cursor:pointer;user-select:none' : ''"
            @click="!isDayLocked(diaIdx) && toggleRest(diaIdx)"
          >
            {{ dia.es_descanso ? t('routine.rest') : t('routine.training') }}
          </div>

          <!-- Exercise list -->
          <div v-if="!dia.es_descanso" class="routine-exercises">
            <div
              v-for="(ej, ejIdx) in dia.ejercicios"
              :key="ejIdx"
              class="routine-exercise-card"
            >
              <button
                v-if="editMode && !isDayLocked(diaIdx)"
                class="routine-remove-btn"
                type="button"
                @click="removeExercise(diaIdx, ejIdx)"
              >×</button>
              <div
                v-if="ej.ejercicio?.grupo_muscular?.nombre || grupoMusPorId[ej.ejercicio?.grupo_muscular_id]"
                class="routine-exercise-group"
              >
                {{ ej.ejercicio?.grupo_muscular?.nombre
                    ? mgName(ej.ejercicio.grupo_muscular.nombre)
                    : grupoMusPorId[ej.ejercicio?.grupo_muscular_id] }}
              </div>
              <div class="routine-exercise-name">{{ exName(ej.ejercicio?.nombre) }}</div>
              <div class="routine-exercise-meta">
                <span v-if="ej.series">{{ ej.series }}×</span>
                <span v-if="ej.repeticiones">{{ ej.repeticiones }}</span>
                <span v-if="ej.peso"> · {{ ej.peso }} kg</span>
              </div>
              <div v-if="ej.notas" class="routine-exercise-notes">{{ ej.notas }}</div>
            </div>

            <p v-if="dia.ejercicios.length === 0 && !editMode" class="routine-no-exercises">
              {{ t('routine.noExercises') }}
            </p>

            <button
              v-if="editMode && !isDayLocked(diaIdx)"
              type="button"
              class="routine-add-exercise-btn"
              @click="openExerciseModal(diaIdx)"
            >
              {{ t('routine.addExercise') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Footer actions ─────────────────────────────────────────────────────── -->
    <div v-if="rutina && !loading" class="routine-footer">
      <template v-if="!editMode">
        <button class="btn-primary btn-sm" @click="enterEdit">{{ t('routine.editRoutine') }}</button>
        <button
          class="btn-secondary btn-sm"
          :disabled="!favorites.length"
          @click="openApplyFavModal"
        >
          {{ t('routine.applyFavorite') }}
        </button>
        <button class="btn-danger btn-sm" @click="handleDelete">{{ t('routine.deleteRoutine') }}</button>
      </template>
      <template v-else>
        <button class="btn-primary btn-sm" :disabled="saving" @click="saveEdit">
          {{ saving ? t('common.loading') : t('routine.saveRoutine') }}
        </button>
        <button class="btn-secondary btn-sm" @click="exitEdit">{{ t('routine.cancelEdit') }}</button>
        <p v-if="saveError" class="form-error" style="margin:0 8px;align-self:center">{{ saveError }}</p>
      </template>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         MODALS
    ════════════════════════════════════════════════════════════════════════════ -->

    <!-- Add Exercise modal -->
    <Modal
      :show="showExerciseModal"
      :title="t('routine.addExerciseTitle')"
      size="sm"
      @close="showExerciseModal = false"
    >
      <form class="settings-form" @submit.prevent="confirmAddExercise">
        <div class="form-group">
          <label>{{ t('routine.selectMuscleGroup') }}</label>
          <select v-model="exerciseForm.grupo_muscular_id" class="select-input" required>
            <option value="">—</option>
            <option v-for="g in gruposTraducidos" :key="g.id" :value="g.id">{{ g.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('routine.selectExercise') }}</label>
          <select
            v-model="exerciseForm.ejercicio_id"
            class="select-input"
            required
            :disabled="!exerciseForm.grupo_muscular_id"
          >
            <option value="">—</option>
            <option v-for="e in filteredEjercicios" :key="e.id" :value="e.id">{{ exName(e.nombre) }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('routine.sets') }}</label>
            <input v-model.number="exerciseForm.series" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>{{ t('routine.reps') }}</label>
            <input v-model.number="exerciseForm.repeticiones" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>{{ t('routine.weight') }}</label>
            <input v-model.number="exerciseForm.peso" type="number" min="0" step="0.5" />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('routine.notes') }}</label>
          <textarea v-model="exerciseForm.notas" rows="2" />
        </div>
        <div class="modal-form-actions">
          <button type="submit" class="btn-primary" :disabled="!exerciseForm.ejercicio_id">
            {{ t('routine.addExercise') }}
          </button>
          <button type="button" class="btn-secondary" @click="showExerciseModal = false">
            {{ t('actions.cancel') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Apply Favorite modal -->
    <Modal
      :show="showApplyFavModal"
      :title="t('routine.applyFavorite')"
      size="sm"
      @close="showApplyFavModal = false"
    >
      <div class="settings-form">
        <div class="form-group">
          <label>{{ t('routine.favorites') }}</label>
          <select v-model="applyFavId" class="select-input">
            <option value="">{{ t('routine.selectFavorite') }}</option>
            <option v-for="fav in favorites" :key="fav.id" :value="fav.id">{{ fav.nombre }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t('routine.applyTo') }}</label>
          <div class="apply-target-options">
            <label class="radio-option">
              <input type="radio" v-model="applyTarget" value="week" />
              {{ t('routine.applyCurrentWeek') }}
            </label>
            <label class="radio-option">
              <input type="radio" v-model="applyTarget" value="weeks" />
              <span>{{ t('routine.applyNextWeeks', { n: applyWeeksCount }) }}</span>
              <input
                v-if="applyTarget === 'weeks'"
                v-model.number="applyWeeksCount"
                type="number"
                min="2"
                max="12"
                style="width:56px;margin-left:8px"
              />
            </label>
            <label class="radio-option">
              <input type="radio" v-model="applyTarget" value="month" />
              {{ t('routine.applySelectMonth') }}
              <input
                v-if="applyTarget === 'month'"
                v-model="applyMonth"
                type="month"
                style="margin-left:8px"
              />
            </label>
          </div>
        </div>

        <p class="form-hint">{{ t('routine.applyNoPast') }}</p>
        <p v-if="applyError"        class="form-error">{{ applyError }}</p>
        <p v-if="applySuccess"      class="form-success">{{ applySuccess }}</p>
        <p v-if="applyConflictWarn" class="form-hint" style="color:var(--warning,#b45309)">
          {{ applyConflictWarn }}
        </p>

        <div class="modal-form-actions">
          <button
            type="button"
            class="btn-primary"
            :disabled="!applyFavId || applyLoading"
            @click="confirmApplyFavorite"
          >
            {{ applyLoading ? t('common.loading') : t('actions.confirm') }}
          </button>
          <button type="button" class="btn-secondary" @click="showApplyFavModal = false">
            {{ t('actions.cancel') }}
          </button>
        </div>
      </div>
    </Modal>

  </div>
</template>
