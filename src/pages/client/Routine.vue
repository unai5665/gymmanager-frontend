<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../../components/Modal.vue'
import {
  getRutina, updateRutina, deleteRutina,
  getGruposMusculares, getEjercicios, getRutinaRango,
} from '../../services/rutinas'
import { getAsistencias } from '../../services/asistencias'
import {
  getFavoritas, createFavorita, deleteFavorita, aplicarFavorita,
} from '../../services/rutinasFavoritas'
import { useAuthStore } from '../../stores/auth'

const { t, te, locale } = useI18n()
const authStore = useAuthStore()

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

function addMonths(d, n) {
  const result = new Date(d)
  result.setMonth(result.getMonth() + n)
  return result
}

function firstDayOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function lastDayOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

// ── Core state ────────────────────────────────────────────────────────────────

const viewMode    = ref('week')   // 'week' | 'month' | 'year'
const currentDate = ref(new Date())

// ── Weekly view state ─────────────────────────────────────────────────────────

const rutina         = ref(null)
const weekAttendance = ref([])
const loading        = ref(false)
const loadError      = ref('')
const editMode       = ref(false)
const editedDias     = ref(null)
const saving         = ref(false)
const saveError      = ref('')

// ── Monthly view state ────────────────────────────────────────────────────────

const monthLoading    = ref(false)
const monthAttendance = ref([])
const monthRoutines   = ref([])

// ── Yearly view state ─────────────────────────────────────────────────────────

const yearLoading    = ref(false)
const yearAttendance = ref([])
const yearRoutines   = ref([])

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

const favorites            = ref([])
const showSaveFavModal     = ref(false)
const saveFavName          = ref('')
const saveFavError         = ref('')
const saveFavLoading       = ref(false)
const showApplyFavModal    = ref(false)
const applyFavId           = ref('')
const applyTarget          = ref('week')   // 'week' | 'weeks' | 'month'
const applyWeeksCount      = ref(2)
const applyMonth           = ref('')
const applyError           = ref('')
const applySuccess         = ref('')
const applyLoading         = ref(false)

// ── Computed: shared ──────────────────────────────────────────────────────────

const todayISO = toISO(new Date())

const weekStart = computed(() => mondayOf(currentDate.value))

const isCurrentPeriod = computed(() => {
  const now = new Date()
  if (viewMode.value === 'week') {
    return toISO(mondayOf(now)) === toISO(weekStart.value)
  }
  if (viewMode.value === 'month') {
    return now.getFullYear() === currentDate.value.getFullYear()
        && now.getMonth()    === currentDate.value.getMonth()
  }
  return now.getFullYear() === currentDate.value.getFullYear()
})

const periodLabel = computed(() => {
  const lc = localeCode()
  if (viewMode.value === 'week') {
    const end  = new Date(weekStart.value.getTime() + 6 * DAY_MS)
    const from = weekStart.value.getDate()
    const to   = end.toLocaleDateString(lc, { day: 'numeric', month: 'long', year: 'numeric' })
    return `${from} – ${to}`
  }
  if (viewMode.value === 'month') {
    return currentDate.value.toLocaleDateString(lc, { month: 'long', year: 'numeric' })
  }
  return String(currentDate.value.getFullYear())
})

// ── Computed: weekly ──────────────────────────────────────────────────────────

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

// Translated muscle group list — re-computes when locale changes
const gruposTraducidos = computed(() =>
  gruposMusculares.value.map(g => ({
    id:    g.id,
    label: mgName(g.nombre),
  }))
)

// id → translated name lookup for exercise cards
const grupoMusPorId = computed(() =>
  Object.fromEntries(gruposMusculares.value.map(g => [g.id, mgName(g.nombre)]))
)

const weekAttendanceMap = computed(() => {
  const map = {}
  for (const a of weekAttendance.value) {
    map[a.fecha_asistencia] = a.asistio
  }
  return map
})

// ── Computed: monthly ─────────────────────────────────────────────────────────

const monthWeeks = computed(() => {
  const year  = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const weeks = []
  let monday  = mondayOf(new Date(year, month, 1))

  while (true) {
    const sunday  = new Date(monday.getTime() + 6 * DAY_MS)
    const overlap = monday.getMonth() === month || sunday.getMonth() === month
    if (!overlap) break
    weeks.push({
      monday,
      sunday,
      mondayISO: toISO(monday),
      sundayISO: toISO(sunday),
      days: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday.getTime() + i * DAY_MS)
        return { date: d, iso: toISO(d), inMonth: d.getMonth() === month }
      }),
    })
    monday = new Date(monday.getTime() + 7 * DAY_MS)
  }
  return weeks
})

const monthAttendanceMap = computed(() => {
  const map = {}
  for (const a of monthAttendance.value) {
    map[a.fecha_asistencia] = a.asistio
  }
  return map
})

const monthRoutineMap = computed(() => {
  const map = {}
  for (const r of monthRoutines.value) {
    map[String(r.fecha_inicio_semana).substring(0, 10)] = r
  }
  return map
})

// ── Computed: monthly calendar helpers ────────────────────────────────────────

const weekDayNames = computed(() =>
  // Jan 5 2026 is a confirmed Monday
  Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 0, 5 + i)
      .toLocaleDateString(localeCode(), { weekday: 'short' })
      .replace('.', '')
  )
)

// ── Computed: yearly ──────────────────────────────────────────────────────────

const yearAttendanceMap = computed(() => {
  const map = {}
  for (const a of yearAttendance.value) map[a.fecha_asistencia] = a.asistio
  return map
})

// Maps each ISO date in the year to 'training' | 'rest'
const yearDayTypeMap = computed(() => {
  const dayNames = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
  const map = {}
  for (const rutina of yearRoutines.value) {
    const monday = new Date(String(rutina.fecha_inicio_semana).substring(0, 10) + 'T00:00:00')
    for (let i = 0; i < 7; i++) {
      const d   = new Date(monday.getTime() + i * DAY_MS)
      const iso = toISO(d)
      const dia = rutina.dias?.find(x => x.dia_semana === dayNames[i])
      if (dia) map[iso] = dia.es_descanso ? 'rest' : 'training'
    }
  }
  return map
})

// Maps each week mondayISO in the year to the trainer object (if trainer-assigned)
const yearTrainerMap = computed(() => {
  const map = {}
  for (const rutina of yearRoutines.value) {
    if (rutina.entrenador_id && rutina.entrenador) {
      map[String(rutina.fecha_inicio_semana).substring(0, 10)] = rutina.entrenador
    }
  }
  return map
})

// Monthly view trainer map (which week mondays have a trainer)
const monthTrainerMap = computed(() => {
  const map = {}
  for (const rutina of monthRoutines.value) {
    if (rutina.entrenador_id && rutina.entrenador) {
      map[String(rutina.fecha_inicio_semana).substring(0, 10)] = rutina.entrenador
    }
  }
  return map
})

const yearMonths = computed(() => {
  const year = currentDate.value.getFullYear()
  return Array.from({ length: 12 }, (_, i) => {
    const firstDay = new Date(year, i, 1)
    const lastDay  = new Date(year, i + 1, 0)
    const monthISO = `${year}-${String(i + 1).padStart(2, '0')}`
    const name     = firstDay.toLocaleDateString(localeCode(), { month: 'long' })

    const leadingEmpty = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const allCells = [
      ...Array.from({ length: leadingEmpty }, (_, e) => ({ iso: null, key: `e${i}${e}`, empty: true })),
      ...Array.from({ length: lastDay.getDate() }, (_, d) => {
        const iso = toISO(new Date(year, i, d + 1))
        return { iso, key: iso, empty: false }
      }),
    ]
    // Pad to full rows of 7
    while (allCells.length % 7 !== 0) {
      allCells.push({ iso: null, key: `t${i}${allCells.length}`, empty: true })
    }

    // Group into week rows, compute mondayISO per row
    const weekRows = []
    for (let w = 0; w < allCells.length; w += 7) {
      const cells = allCells.slice(w, w + 7)
      const firstReal = cells.find(d => !d.empty)
      const mondayISO = firstReal
        ? toISO(mondayOf(new Date(firstReal.iso + 'T00:00:00')))
        : null
      weekRows.push({ cells, mondayISO })
    }

    return { monthISO, name, month: i, year, weekRows }
  })
})

// ── Navigation ────────────────────────────────────────────────────────────────

function prevPeriod() {
  if (viewMode.value === 'week')  currentDate.value = new Date(currentDate.value.getTime() - 7 * DAY_MS)
  if (viewMode.value === 'month') currentDate.value = addMonths(currentDate.value, -1)
  if (viewMode.value === 'year')  currentDate.value = new Date(currentDate.value.getFullYear() - 1, currentDate.value.getMonth(), 1)
}

function nextPeriod() {
  if (viewMode.value === 'week')  currentDate.value = new Date(currentDate.value.getTime() + 7 * DAY_MS)
  if (viewMode.value === 'month') currentDate.value = addMonths(currentDate.value, 1)
  if (viewMode.value === 'year')  currentDate.value = new Date(currentDate.value.getFullYear() + 1, currentDate.value.getMonth(), 1)
}

function goToCurrent() { currentDate.value = new Date() }

function setView(mode) {
  if (editMode.value) exitEdit()
  viewMode.value = mode
}

function goToWeek(mondayDate) {
  currentDate.value = mondayDate
  viewMode.value    = 'week'
}

function goToMonth(year, month) {
  currentDate.value = new Date(year, month, 1)
  viewMode.value    = 'month'
}

// ── Load functions ────────────────────────────────────────────────────────────

async function loadWeek() {
  loading.value = true; loadError.value = ''
  try {
    const monday = weekStart.value
    const sunday = new Date(monday.getTime() + 6 * DAY_MS)
    const [rutinaData, asistData] = await Promise.all([
      getRutina(toISO(monday)),
      getAsistencias({ desde: toISO(monday), hasta: toISO(sunday), per_page: 7 }),
    ])
    rutina.value         = rutinaData
    weekAttendance.value = asistData.data ?? []
  } catch (e) {
    loadError.value = e.message
  }
  loading.value = false
}

async function loadMonth() {
  monthLoading.value = true
  const first       = firstDayOfMonth(currentDate.value)
  const last        = lastDayOfMonth(currentDate.value)
  // Some weeks start before the 1st of the month — use that Monday as the lower bound
  const firstMonday = mondayOf(first)
  try {
    const [asistData, rutinaData] = await Promise.all([
      getAsistencias({ desde: toISO(first), hasta: toISO(last), per_page: 35 }),
      getRutinaRango(toISO(firstMonday), toISO(last)),
    ])
    monthAttendance.value = asistData.data ?? []
    monthRoutines.value   = rutinaData
  } catch (e) {
    loadError.value = e.message
  }
  monthLoading.value = false
}

async function loadYear() {
  yearLoading.value = true
  const year = currentDate.value.getFullYear()
  const from = `${year}-01-01`
  const to   = `${year}-12-31`
  try {
    const [asistData, rutinaData] = await Promise.all([
      getAsistencias({ desde: from, hasta: to, per_page: 366 }),
      getRutinaRango(from, to),
    ])
    yearAttendance.value = asistData.data ?? []
    yearRoutines.value   = rutinaData ?? []
  } catch (e) {
    loadError.value = e.message
  }
  yearLoading.value = false
}

async function dispatchLoad() {
  if (viewMode.value === 'week')  await loadWeek()
  if (viewMode.value === 'month') await loadMonth()
  if (viewMode.value === 'year')  await loadYear()
}

watch([viewMode, currentDate], () => {
  if (editMode.value) exitEdit()
  dispatchLoad()
})

// ── Weekly edit mode ──────────────────────────────────────────────────────────

function enterEdit() {
  editedDias.value = (rutina.value?.dias ?? []).map(dia => ({
    ...dia,
    ejercicios: dia.ejercicios.map(ej => ({ ...ej })),
  }))
  saveError.value = ''
  editMode.value  = true
}

function exitEdit() {
  editMode.value   = false
  editedDias.value = null
  saveError.value  = ''
}

async function saveEdit() {
  saving.value = true; saveError.value = ''
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
    saveError.value = e.message
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

// ── Favorites ─────────────────────────────────────────────────────────────────

async function reloadFavorites() {
  favorites.value = await getFavoritas()
}

async function openSaveFavModal() {
  saveFavName.value  = ''
  saveFavError.value = ''
  showSaveFavModal.value = true
}

async function confirmSaveFavorite() {
  if (!saveFavName.value.trim()) return
  saveFavLoading.value = true; saveFavError.value = ''
  try {
    const dias = (rutina.value?.dias ?? []).map(dia => ({
      dia_semana:  dia.dia_semana,
      es_descanso: dia.es_descanso,
      ejercicios:  (dia.ejercicios ?? []).map((ej, idx) => ({
        ejercicio_id:  ej.ejercicio_id ?? ej.ejercicio?.id,
        series:        ej.series        || null,
        repeticiones:  ej.repeticiones  || null,
        peso:          ej.peso          || null,
        notas:         ej.notas         || null,
        orden:         idx,
      })),
    }))
    await createFavorita({ nombre: saveFavName.value.trim(), dias })
    await reloadFavorites()
    showSaveFavModal.value = false
  } catch (e) {
    saveFavError.value = e.message
  }
  saveFavLoading.value = false
}

async function confirmDeleteFavorite(fav) {
  if (!confirm(t('routine.deleteFavoriteConfirm'))) return
  await deleteFavorita(fav.id)
  await reloadFavorites()
}

function openApplyFavModal() {
  applyFavId.value    = favorites.value[0]?.id ?? ''
  applyTarget.value   = 'week'
  applyWeeksCount.value = 2
  applyMonth.value    = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}`
  applyError.value    = ''
  applySuccess.value  = ''
  showApplyFavModal.value = true
}

async function confirmApplyFavorite() {
  if (!applyFavId.value) return
  applyLoading.value = true; applyError.value = ''; applySuccess.value = ''
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

    const result = await aplicarFavorita(applyFavId.value, semanas)
    applySuccess.value = t('routine.applySuccess', { n: result.aplicadas })
    if (viewMode.value === 'week') await loadWeek()
    if (viewMode.value === 'month') await loadMonth()
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

// Yearly heatmap uses richer logic: rest days, pre-creation blanks
function yearDotClass(iso) {
  if (iso > todayISO) return 'att-dot--future'
  const createdAt = authStore.user?.created_at?.substring(0, 10)
  if (createdAt && iso < createdAt) return 'att-dot--future'
  const attended = yearAttendanceMap.value[iso]
  if (attended === true)  return 'att-dot--attended'
  if (attended === false) return 'att-dot--missed'
  const dayType = yearDayTypeMap.value[iso]
  if (dayType === 'rest') return 'att-dot--rest'
  return 'att-dot--nodata'
}

// A day is locked if any attendance record exists for it (client already marked that day)
function isDayLocked(diaIdx) {
  const iso = dayHeaders.value[diaIdx]?.iso
  return iso ? iso in weekAttendanceMap.value : false
}

// ── Mount ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
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
      <h1 class="page-title" style="margin:0">{{ t('routine.title') }}</h1>
      <div class="view-mode-tabs">
        <button
          v-for="m in ['week','month','year']"
          :key="m"
          class="view-tab"
          :class="{ active: viewMode === m }"
          @click="setView(m)"
        >
          {{ t(`routine.view${m.charAt(0).toUpperCase() + m.slice(1)}`) }}
        </button>
      </div>
    </div>

    <!-- ── Period navigation ─────────────────────────────────────────────────── -->
    <div class="routine-nav-header">
      <button class="routine-nav-btn" @click="prevPeriod">‹</button>
      <span class="routine-period-label">{{ periodLabel }}</span>
      <button class="routine-nav-btn" @click="nextPeriod">›</button>
      <button
        v-if="!isCurrentPeriod"
        class="btn-secondary btn-sm"
        style="margin-left:6px"
        @click="goToCurrent"
      >
        {{ t('routine.goToday') }}
      </button>
    </div>

    <p v-if="loadError" class="form-error" style="margin-bottom:12px">{{ loadError }}</p>

    <!-- ════════════════════════════════════════════════════════════════════════
         WEEKLY VIEW
    ════════════════════════════════════════════════════════════════════════════ -->
    <template v-if="viewMode === 'week'">
      <div v-if="loading" class="dashboard-loading"><span class="spinner" /></div>

      <template v-else-if="rutina">
        <!-- Trainer assignment banner -->
        <div v-if="rutina.entrenador_id" class="trainer-badge">
          {{ t('routine.trainerAssigned') }}
          {{ rutina.entrenador?.nombre }} {{ rutina.entrenador?.apellido }}
        </div>

        <div class="routine-grid-wrap">
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
                <!-- Lock icon when editing a locked day -->
                <span
                  v-if="editMode && isDayLocked(diaIdx)"
                  class="day-lock-icon"
                  :title="t('routine.lockedDay')"
                >🔒</span>
                <!-- Attendance dot (view mode) -->
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
      </template>

      <!-- Footer actions -->
      <div v-if="rutina && !loading" class="routine-footer">
        <template v-if="!editMode">
          <button class="btn-primary btn-sm" @click="enterEdit">{{ t('routine.editRoutine') }}</button>
          <button class="btn-secondary btn-sm" @click="openSaveFavModal">{{ t('routine.saveAsFavorite') }}</button>
          <button class="btn-secondary btn-sm" @click="openApplyFavModal" :disabled="!favorites.length">{{ t('routine.applyFavorite') }}</button>
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
    </template>

    <!-- ════════════════════════════════════════════════════════════════════════
         MONTHLY VIEW — calendar grid
    ════════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="viewMode === 'month'">
      <div v-if="monthLoading" class="dashboard-loading"><span class="spinner" /></div>

      <div v-else class="month-calendar">

        <!-- Weekday header row -->
        <div class="month-cal-row month-cal-row--header">
          <div class="month-cal-badge-col" />
          <div v-for="name in weekDayNames" :key="name" class="month-cal-cell month-cal-cell--dayname">
            {{ name }}
          </div>
        </div>

        <!-- One row per week -->
        <div
          v-for="week in monthWeeks"
          :key="week.mondayISO"
          class="month-cal-row month-cal-row--week"
          :title="monthTrainerMap[week.mondayISO]
            ? `${t('routine.trainerAssigned')} ${monthTrainerMap[week.mondayISO].nombre} ${monthTrainerMap[week.mondayISO].apellido}`
            : monthRoutineMap[week.mondayISO]
              ? (monthRoutineMap[week.mondayISO].es_predeterminada ? t('routine.default') : t('routine.custom'))
              : t('routine.noRoutineThisWeek')"
          @click="goToWeek(week.monday)"
        >
          <!-- Routine-type indicator bar (purple when trainer-assigned) -->
          <div class="month-cal-badge-col">
            <span
              class="month-week-indicator"
              :class="monthTrainerMap[week.mondayISO]
                ? 'month-week-indicator--trainer'
                : monthRoutineMap[week.mondayISO]
                  ? (monthRoutineMap[week.mondayISO].es_predeterminada
                      ? 'month-week-indicator--default'
                      : 'month-week-indicator--custom')
                  : 'month-week-indicator--none'"
            />
          </div>

          <!-- 7 day cells -->
          <div
            v-for="day in week.days"
            :key="day.iso"
            class="month-cal-cell"
            :class="{
              'month-cal-cell--out':   !day.inMonth,
              'month-cal-cell--today':  day.iso === todayISO,
            }"
          >
            <span class="month-cal-day-num">{{ day.date.getDate() }}</span>
            <span
              class="att-dot"
              :class="!day.inMonth ? 'att-dot--future' : attDotClass(day.iso, monthAttendanceMap)"
            />
          </div>
        </div>

      </div>
    </template>

    <!-- ════════════════════════════════════════════════════════════════════════
         YEARLY VIEW — mini heatmap calendar per month
    ════════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="viewMode === 'year'">
      <div v-if="yearLoading" class="dashboard-loading"><span class="spinner" /></div>

      <div v-else class="year-view">
        <div
          v-for="m in yearMonths"
          :key="m.monthISO"
          class="year-month-card"
          role="button"
          @click="goToMonth(m.year, m.month)"
        >
          <div class="year-month-name">{{ m.name }}</div>

          <!-- Mini heatmap: 7 day columns + 1 trainer-indicator column per row -->
          <div class="year-mini-grid">
            <template v-for="(week, wi) in m.weekRows" :key="week.mondayISO ?? `w${wi}`">
              <div
                v-for="day in week.cells"
                :key="day.key"
                class="year-mini-day"
                :class="day.empty ? 'year-mini-day--empty' : yearDotClass(day.iso)"
              >
                <span v-if="!day.empty" class="year-mini-day-num">
                  {{ Number(day.iso.split('-')[2]) }}
                </span>
              </div>
              <!-- 8th column: purple dot when this week was trainer-assigned -->
              <div
                class="year-mini-trainer-col"
                :title="week.mondayISO && yearTrainerMap[week.mondayISO]
                  ? `${t('routine.trainerAssigned')} ${yearTrainerMap[week.mondayISO].nombre} ${yearTrainerMap[week.mondayISO].apellido}`
                  : ''"
              >
                <span
                  v-if="week.mondayISO && yearTrainerMap[week.mondayISO]"
                  class="year-mini-trainer-dot"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

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

    <!-- Save as Favorite modal -->
    <Modal
      :show="showSaveFavModal"
      :title="t('routine.saveAsFavorite')"
      size="sm"
      @close="showSaveFavModal = false"
    >
      <div class="settings-form">
        <div class="form-group">
          <label>{{ t('routine.favoriteNameLabel') }}</label>
          <input
            v-model="saveFavName"
            type="text"
            :placeholder="t('routine.favoriteNamePlaceholder')"
            maxlength="100"
            autofocus
          />
        </div>

        <!-- Existing favorites list -->
        <div v-if="favorites.length" class="favorites-list">
          <div
            v-for="fav in favorites"
            :key="fav.id"
            class="favorite-item"
          >
            <span class="favorite-item-name">{{ fav.nombre }}</span>
            <button
              type="button"
              class="btn-danger btn-xs"
              @click="confirmDeleteFavorite(fav)"
            >{{ t('actions.delete') }}</button>
          </div>
        </div>
        <p v-else class="form-hint">{{ t('routine.noFavorites') }}</p>

        <p v-if="saveFavError" class="form-error">{{ saveFavError }}</p>

        <div class="modal-form-actions">
          <button
            type="button"
            class="btn-primary"
            :disabled="!saveFavName.trim() || saveFavLoading"
            @click="confirmSaveFavorite"
          >
            {{ saveFavLoading ? t('common.loading') : t('actions.save') }}
          </button>
          <button type="button" class="btn-secondary" @click="showSaveFavModal = false">
            {{ t('actions.cancel') }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Apply Favorite modal -->
    <Modal
      :show="showApplyFavModal"
      :title="t('routine.applyFavorite')"
      size="sm"
      @close="showApplyFavModal = false"
    >
      <div class="settings-form">
        <!-- Select favorite -->
        <div class="form-group">
          <label>{{ t('routine.favorites') }}</label>
          <select v-model="applyFavId" class="select-input">
            <option value="">{{ t('routine.selectFavorite') }}</option>
            <option v-for="fav in favorites" :key="fav.id" :value="fav.id">{{ fav.nombre }}</option>
          </select>
        </div>

        <!-- Apply target -->
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
        <p v-if="applyError"   class="form-error">{{ applyError }}</p>
        <p v-if="applySuccess" class="form-success">{{ applySuccess }}</p>

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
