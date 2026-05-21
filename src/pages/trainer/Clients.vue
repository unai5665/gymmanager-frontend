<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserTable } from '../../composables/useUserTable'
import { getAsistencias } from '../../services/asistencias'
import DataTable     from '../../components/DataTable.vue'
import StatusBadge   from '../../components/StatusBadge.vue'
import DropdownMenu  from '../../components/DropdownMenu.vue'
import SearchBar     from '../../components/SearchBar.vue'
import Pagination    from '../../components/Pagination.vue'
import Modal         from '../../components/Modal.vue'

const { t }  = useI18n()
const router = useRouter()
const u      = useUserTable({ showOrgFilter: false })

const columns = computed(() => [
  { key: 'fullName', label: t('table.name') },
  { key: 'email',    label: t('table.email') },
  { key: 'estado',   label: t('table.status') },
  // { key: 'racha_actual',      label: t('clients.currentStreak') },
  // { key: 'ultima_asistencia', label: t('clients.lastAttendance') },
  { key: 'actions',  label: '' },
])

// Attendance modal
const showAttendance   = ref(false)
const attendanceClient = ref(null)
const attendanceRows   = ref([])
const attendancePage   = ref(1)
const attendanceLastPage = ref(1)
const attendanceLoading  = ref(false)

async function openAttendance(row) {
  attendanceClient.value = row
  attendancePage.value   = 1
  showAttendance.value   = true
  await loadAttendance(row.id, 1)
}

async function loadAttendance(clienteId, pg) {
  attendanceLoading.value = true
  try {
    const res = await getAsistencias({ cliente_id: clienteId, page: pg })
    attendanceRows.value     = res.data ?? res
    attendanceLastPage.value = res.last_page ?? 1
  } catch {}
  attendanceLoading.value = false
}

async function onAttendancePage(p) {
  attendancePage.value = p
  await loadAttendance(attendanceClient.value.id, p)
}

function formatDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split(/[-T]/).map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function getActions(row) {
  return [
    { label: t('attendance.viewHistory'), action: () => openAttendance(row) },
    { label: t('clients.assignRoutine'),  action: () => router.push(`/trainer/clients/${row.id}/routine`) },
  ]
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ t('clients.title') }}</h1>
    </div>

    <div class="filters-bar">
      <SearchBar @search="u.onSearch" />
    </div>

    <p v-if="u.error.value" class="form-error" style="margin-bottom:16px">{{ u.error.value }}</p>

    <DataTable :columns="columns" :rows="u.rows.value" :loading="u.loading.value">
      <template #cell-fullName="{ row }">{{ row.nombre }} {{ row.apellido }}</template>
      <template #cell-estado="{ value }"><StatusBadge :status="value" /></template>
      <template #cell-racha_actual="{ row }">
        {{ row.racha?.racha_actual ?? '—' }}
      </template>
      <template #cell-ultima_asistencia="{ row }">
        {{ formatDate(row.racha?.ultimo_dia_exitoso) }}
      </template>
      <template #cell-actions="{ row }">
        <DropdownMenu :items="getActions(row)" />
      </template>
    </DataTable>

    <Pagination :current-page="u.page.value" :last-page="u.lastPage.value" @change="u.onPage" />

    <!-- Attendance history modal -->
    <Modal
      :show="showAttendance"
      :title="`${attendanceClient?.nombre ?? ''} — ${t('attendance.title')}`"
      size="md"
      @close="showAttendance = false"
    >
      <div v-if="attendanceLoading" style="text-align:center;padding:24px"><span class="spinner" /></div>
      <template v-else>
        <div v-if="attendanceRows.length === 0" class="attendance-empty">
          {{ t('attendance.noData') }}
        </div>
        <div v-else class="attendance-list">
          <div
            v-for="row in attendanceRows"
            :key="row.id"
            class="attendance-list-item"
            :class="row.asistio ? 'attendance-list-item--ok' : 'attendance-list-item--miss'"
          >
            <div class="attendance-list-date">{{ formatDate(row.fecha_asistencia) }}</div>
            <div class="attendance-list-status">
              <span class="attendance-status-dot" />
              {{ row.asistio ? t('attendance.attended') : t('attendance.missed') }}
            </div>
          </div>
        </div>
        <Pagination
          v-if="attendanceLastPage > 1"
          :current-page="attendancePage"
          :last-page="attendanceLastPage"
          @change="onAttendancePage"
          style="margin-top:12px"
        />
      </template>
    </Modal>
  </div>
</template>
