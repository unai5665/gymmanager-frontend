<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserTable } from '../../composables/useUserTable'
import { exportarUsuarios } from '../../services/usuarios'
import DataTable     from '../../components/DataTable.vue'
import StatusBadge   from '../../components/StatusBadge.vue'
import DropdownMenu  from '../../components/DropdownMenu.vue'
import SearchBar     from '../../components/SearchBar.vue'
import Pagination    from '../../components/Pagination.vue'
import Modal         from '../../components/Modal.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import PasswordInput from '../../components/PasswordInput.vue'

const { t } = useI18n()
const u = useUserTable({ showOrgFilter: false })


const exporting = ref(false)
async function exportar() {
  exporting.value = true
  try {
    const params = {}
    if (u.search.value)       params.buscar = u.search.value
    if (u.filterRol.value)    params.rol    = u.filterRol.value
    if (u.filterEstado.value) params.estado = u.filterEstado.value
    await exportarUsuarios(params)
  } finally {
    exporting.value = false
  }
}

const columns = computed(() => [
  { key: 'fullName', label: t('table.name') },
  { key: 'email',    label: t('table.email') },
  { key: 'rol',      label: t('table.role') },
  { key: 'estado',   label: t('table.status') },
  { key: 'actions',  label: '' },
])

const ROLES   = ['administrador', 'entrenador', 'cliente']
const ESTADOS = ['activo', 'inactivo']

function getActions(row) {
  return [
    { label: t('actions.edit'),   action: () => u.openEdit(row) },
    { label: t('actions.delete'), action: () => u.openDelete(row), variant: 'danger' },
  ]
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ t('users.title') }}</h1>
      <button class="btn-secondary btn-sm" :disabled="exporting" @click="exportar()">{{ exporting ? t('common.loading') : t('actions.export') }}</button>
      <button class="btn-primary btn-sm" @click="u.openCreate()">+ {{ t('users.create') }}</button>
    </div>

    <div class="filters-bar">
      <SearchBar @search="u.onSearch" />
      <div class="select-wrap">
        <select v-model="u.filterRol.value" class="select-input" @change="u.load()">
          <option value="">{{ t('roles.all') }}</option>
          <option v-for="r in ROLES" :key="r" :value="r">{{ t(`roles.${r}`) }}</option>
        </select>
      </div>
      <div class="select-wrap">
        <select v-model="u.filterEstado.value" class="select-input" @change="u.load()">
          <option value="">{{ t('status.all') }}</option>
          <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
        </select>
      </div>
    </div>

    <p v-if="u.error.value" class="form-error" style="margin-bottom:16px">{{ u.error.value }}</p>

    <DataTable :columns="columns" :rows="u.rows.value" :loading="u.loading.value">
      <template #cell-fullName="{ row }">{{ row.nombre }} {{ row.apellido }}</template>
      <template #cell-estado="{ value }"><StatusBadge :status="value" /></template>
      <template #cell-rol="{ value }">{{ t(`roles.${value}`) }}</template>
      <template #cell-actions="{ row }"><DropdownMenu :items="getActions(row)" /></template>
    </DataTable>

    <Pagination :current-page="u.page.value" :last-page="u.lastPage.value" @change="u.onPage" />

    <!-- Create -->
    <Modal :show="u.showCreate.value" :title="t('users.create')" size="lg" @close="u.showCreate.value = false">
      <form class="modal-form" @submit.prevent="u.handleCreate()">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('users.firstName') }}</label>
            <input v-model="u.form.value.nombre" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('users.lastName') }}</label>
            <input v-model="u.form.value.apellido" type="text" required />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('login.emailPlaceholder') }}</label>
          <input v-model="u.form.value.email" type="email" required />
        </div>
        <div class="form-group">
          <label>{{ t('users.phone') }}</label>
          <input v-model="u.form.value.telefono" type="tel" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('table.role') }}</label>
            <select v-model="u.form.value.rol" class="select-input">
              <option v-for="r in ROLES" :key="r" :value="r">{{ t(`roles.${r}`) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('table.status') }}</label>
            <select v-model="u.form.value.estado" class="select-input">
              <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('users.password') }}</label>
          <PasswordInput v-model="u.form.value.password" required />
        </div>
        <p v-if="u.formError.value" class="form-error">{{ u.formError.value }}</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="u.showCreate.value = false">{{ t('actions.cancel') }}</button>
          <button type="submit" class="btn-primary btn-sm" :disabled="u.formLoading.value">
            {{ u.formLoading.value ? t('common.loading') : t('actions.create') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit -->
    <Modal :show="u.showEdit.value" :title="t('users.edit')" size="lg" @close="u.showEdit.value = false">
      <form class="modal-form" @submit.prevent="u.handleEdit()">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('users.firstName') }}</label>
            <input v-model="u.form.value.nombre" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('users.lastName') }}</label>
            <input v-model="u.form.value.apellido" type="text" required />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('login.emailPlaceholder') }}</label>
          <input v-model="u.form.value.email" type="email" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('table.role') }}</label>
            <div class="field-readonly">{{ t(`roles.${u.form.value.rol}`) }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('table.status') }}</label>
            <select v-model="u.form.value.estado" class="select-input">
              <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('users.newPassword') }}</label>
          <PasswordInput v-model="u.form.value.password" />
        </div>
        <p v-if="u.formError.value" class="form-error">{{ u.formError.value }}</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="u.showEdit.value = false">{{ t('actions.cancel') }}</button>
          <button type="submit" class="btn-primary btn-sm" :disabled="u.formLoading.value">
            {{ u.formLoading.value ? t('common.loading') : t('common.save') }}
          </button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :show="u.showDelete.value"
      :title="t('users.delete')"
      :message="t('users.deleteConfirm')"
      @confirm="u.handleDelete()"
      @cancel="u.showDelete.value = false"
    />
  </div>
</template>
