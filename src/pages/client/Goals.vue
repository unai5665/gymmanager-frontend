<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '../../components/Modal.vue'
import {
  getObjetivos, createObjetivo, updateObjetivo, deleteObjetivo,
} from '../../services/objetivos'

const { t } = useI18n()

const goals   = ref([])
const loading = ref(false)
const error   = ref('')
const filter  = ref('all')

const FILTERS = ['all', 'en_progreso', 'completado', 'fallido']

const showForm    = ref(false)
const showDetail  = ref(false)
const editingGoal = ref(null)
const detailGoal  = ref(null)
const saving      = ref(false)
const formError   = ref('')

const form = ref({
  nombre: '', comentarios: '',
  duracion_valor: 4, duracion_unidad: 'weeks',
  fecha_fin: '', estado: 'en_progreso',
})

// ── Computed ──────────────────────────────────────────────────────────────────

const filteredGoals = computed(() =>
  filter.value === 'all'
    ? goals.value
    : goals.value.filter(g => g.estado === filter.value)
)

const maxDuration = computed(() =>
  ({ days: 6, weeks: 3, months: 6 }[form.value.duracion_unidad] ?? 6)
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysLeft(goal) {
  if (!goal.fecha_fin) return null
  const [y, m, d] = goal.fecha_fin.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / 86400000)
}

function formatDate(str) {
  if (!str) return '—'
  const clean = str.split('T')[0]
  const [y, m, d] = clean.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function computeFechaFin(valor, unidad) {
  const d = new Date()
  if (unidad === 'days')        d.setDate(d.getDate() + Number(valor))
  else if (unidad === 'weeks')  d.setDate(d.getDate() + Number(valor) * 7)
  else if (unidad === 'months') d.setMonth(d.getMonth() + Number(valor))
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Data ──────────────────────────────────────────────────────────────────────

async function load() {
  loading.value = true
  error.value   = ''
  try { goals.value = await getObjetivos() }
  catch (e) { error.value = e.message }
  loading.value = false
}

// ── Modals ────────────────────────────────────────────────────────────────────

function openAdd() {
  editingGoal.value = null
  form.value = {
    nombre: '', comentarios: '',
    duracion_valor: 4, duracion_unidad: 'weeks',
    fecha_fin: '', estado: 'en_progreso',
  }
  formError.value = ''
  showForm.value  = true
}

function openEdit(goal, ev) {
  ev?.stopPropagation()
  editingGoal.value = goal
  form.value = {
    nombre:         goal.nombre,
    comentarios:    goal.comentarios ?? '',
    duracion_valor: 4, duracion_unidad: 'weeks',
    fecha_fin:      goal.fecha_fin ?? '',
    estado:         goal.estado,
  }
  formError.value = ''
  showForm.value  = true
}

function openDetail(goal) {
  detailGoal.value = goal
  showDetail.value = true
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function saveGoal() {
  saving.value    = true
  formError.value = ''
  try {
    if (editingGoal.value) {
      await updateObjetivo(editingGoal.value.id, {
        nombre:      form.value.nombre,
        comentarios: form.value.comentarios,
        fecha_fin:   form.value.fecha_fin,
        estado:      form.value.estado,
      })
    } else {
      await createObjetivo({
        nombre:      form.value.nombre,
        comentarios: form.value.comentarios,
        fecha_fin:   computeFechaFin(form.value.duracion_valor, form.value.duracion_unidad),
      })
    }
    showForm.value = false
    await load()
  } catch (e) {
    formError.value = e.message
  }
  saving.value = false
}

async function handleDelete(goal, ev) {
  ev?.stopPropagation()
  if (!confirm(t('goals.deleteConfirm'))) return
  try {
    await deleteObjetivo(goal.id)
    await load()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ t('goals.title') }}</h1>
      <button class="btn-primary btn-sm" @click="openAdd">{{ t('goals.add') }}</button>
    </div>

    <!-- Filters -->
    <div class="goals-filters">
      <button
        v-for="f in FILTERS"
        :key="f"
        class="goal-filter-btn"
        :class="{ 'goal-filter-btn--active': filter === f }"
        @click="filter = f"
      >
        {{ t(`goals.filter.${f}`) }}
      </button>
    </div>

    <p v-if="error" class="form-error" style="margin-bottom:16px">{{ error }}</p>
    <div v-if="loading" class="dashboard-loading"><span class="spinner" /></div>

    <template v-else>
      <div v-if="filteredGoals.length === 0" class="attendance-empty" style="padding:48px 0">
        {{ filter === 'all'
          ? t('goals.noGoals')
          : t('goals.noGoalsFiltered', { estado: t(`goals.filter.${filter}`) }) }}
      </div>

      <div v-else class="goals-list">
        <div
          v-for="goal in filteredGoals"
          :key="goal.id"
          class="goal-card"
          :class="`goal-card--${goal.estado}`"
          @click="openDetail(goal)"
        >
          <div class="goal-card-info">
            <div class="goal-card-title">{{ goal.nombre }}</div>
            <div class="goal-card-meta">{{ formatDate(goal.fecha_fin) }}</div>
          </div>

          <span class="goal-card-badge" :class="`goal-card-badge--${goal.estado}`">
            <template v-if="goal.estado !== 'en_progreso'">
              {{ t(`goals.status.${goal.estado}`) }}
            </template>
            <template v-else-if="daysLeft(goal) !== null && daysLeft(goal) >= 0">
              {{ t('goals.daysLeft', { n: daysLeft(goal) }) }}
            </template>
            <template v-else>{{ t(`goals.status.${goal.estado}`) }}</template>
          </span>

          <div class="goal-card-actions" @click.stop>
            <button class="btn-icon" :title="t('actions.edit')" @click="openEdit(goal, $event)">✎</button>
            <button class="btn-icon btn-icon--danger" :title="t('actions.delete')" @click="handleDelete(goal, $event)">✕</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Add / Edit modal -->
    <Modal
      :show="showForm"
      :title="editingGoal ? t('goals.editTitle') : t('goals.add')"
      size="sm"
      @close="showForm = false"
    >
      <form class="settings-form" @submit.prevent="saveGoal">
        <div class="form-group">
          <label>{{ t('goals.fields.nombre') }}</label>
          <input v-model="form.nombre" type="text" required />
        </div>

        <div class="form-group">
          <label>{{ t('goals.fields.comentarios') }}</label>
          <textarea v-model="form.comentarios" rows="3" />
        </div>

        <template v-if="!editingGoal">
          <div class="form-group">
            <label>{{ t('goals.fields.duration') }}</label>
            <div class="duration-picker">
              <input
                v-model.number="form.duracion_valor"
                type="number" min="1" :max="maxDuration"
                class="duration-number"
              />
              <select v-model="form.duracion_unidad" class="select-input duration-unit">
                <option value="days">{{ t('goals.duration.days') }}</option>
                <option value="weeks">{{ t('goals.duration.weeks') }}</option>
                <option value="months">{{ t('goals.duration.months') }}</option>
              </select>
            </div>
            <span class="form-hint">
              {{ t('goals.fields.endDate') }}: {{ formatDate(computeFechaFin(form.duracion_valor, form.duracion_unidad)) }}
            </span>
          </div>
        </template>

        <template v-else>
          <div class="form-group">
            <label>{{ t('goals.fields.endDate') }}</label>
            <input v-model="form.fecha_fin" type="date" required />
          </div>
          <div class="form-group">
            <label>{{ t('goals.fields.status') }}</label>
            <select v-model="form.estado" class="select-input">
              <option value="en_progreso">{{ t('goals.status.en_progreso') }}</option>
              <option value="completado">{{ t('goals.status.completado') }}</option>
              <option value="fallido">{{ t('goals.status.fallido') }}</option>
            </select>
          </div>
        </template>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <div class="modal-form-actions">
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? t('common.loading') : t('common.save') }}
          </button>
          <button type="button" class="btn-secondary" @click="showForm = false">
            {{ t('actions.cancel') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Detail modal -->
    <Modal
      :show="showDetail"
      :title="detailGoal?.nombre ?? ''"
      size="sm"
      @close="showDetail = false"
    >
      <template v-if="detailGoal">
        <span
          class="goal-card-badge"
          :class="`goal-card-badge--${detailGoal.estado}`"
          style="display:inline-block;margin-bottom:16px"
        >
          {{ t(`goals.status.${detailGoal.estado}`) }}
        </span>

        <p v-if="detailGoal.comentarios" class="goal-detail-desc">
          {{ detailGoal.comentarios }}
        </p>

        <div class="goal-detail-meta">
          <div class="goal-detail-row">
            <span class="goal-detail-label">{{ t('goals.createdAt') }}</span>
            <span>{{ formatDate(detailGoal.fecha_inicio) }}</span>
          </div>
          <div class="goal-detail-row">
            <span class="goal-detail-label">{{ t('goals.endsAt') }}</span>
            <span>{{ formatDate(detailGoal.fecha_fin) }}</span>
          </div>
          <div v-if="detailGoal.estado === 'en_progreso'" class="goal-detail-row">
            <span class="goal-detail-label">{{ t('goals.remaining') }}</span>
            <span>
              {{ daysLeft(detailGoal) >= 0
                ? t('goals.daysLeft', { n: daysLeft(detailGoal) })
                : t('goals.overdue') }}
            </span>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>
