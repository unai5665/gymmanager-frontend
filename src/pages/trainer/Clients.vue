<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserTable } from '../../composables/useUserTable'
import DataTable     from '../../components/DataTable.vue'
import StatusBadge   from '../../components/StatusBadge.vue'
import DropdownMenu  from '../../components/DropdownMenu.vue'
import SearchBar     from '../../components/SearchBar.vue'
import Pagination    from '../../components/Pagination.vue'

const { t } = useI18n()
const u = useUserTable({ showOrgFilter: false })

const columns = computed(() => [
  { key: 'fullName', label: t('table.name') },
  { key: 'email',    label: t('table.email') },
  { key: 'estado',   label: t('table.status') },
  { key: 'actions',  label: '' },
])

function getActions(row) {
  return [
    { label: t('actions.openRoutine'), action: () => {} },
    { label: t('actions.edit'),        action: () => u.openEdit(row) },
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
      <template #cell-actions="{ row }">
        <DropdownMenu :items="getActions(row)" />
      </template>
    </DataTable>

    <Pagination :current-page="u.page.value" :last-page="u.lastPage.value" @change="u.onPage" />
  </div>
</template>
