<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserTable } from '../../composables/useUserTable'
import DataTable     from '../../components/DataTable.vue'
import StatusBadge   from '../../components/StatusBadge.vue'
import DropdownMenu  from '../../components/DropdownMenu.vue'
import SearchBar     from '../../components/SearchBar.vue'
import Pagination    from '../../components/Pagination.vue'
import Modal         from '../../components/Modal.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

const { t } = useI18n()
const u = useUserTable({ showOrgFilter: true })

const columns = computed(() => [
  { key: 'fullName',     label: t('table.name') },
  { key: 'email',        label: t('table.email') },
  { key: 'rol',          label: t('table.role') },
  { key: 'estado',       label: t('table.status') },
  { key: 'organizacion', label: t('table.organization') },
  { key: 'actions',      label: '' },
])

const ROLES   = ['superadmin', 'administrador', 'entrenador', 'cliente']
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
      <button class="btn-primary btn-sm" @click="u.openCreate()">+ {{ t('users.create') }}</button>
    </div>

    <div class="filters-bar">
      <SearchBar @search="u.onSearch" />
      <select v-model="u.filterRol.value" class="select-input" @change="u.load()">
        <option value="">{{ t('roles.all') }}</option>
        <option v-for="r in ROLES" :key="r" :value="r">{{ t(`roles.${r}`) }}</option>
      </select>
      <select v-model="u.filterEstado.value" class="select-input" @change="u.load()">
        <option value="">{{ t('status.all') }}</option>
        <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
      </select>
      <select v-model="u.filterOrg.value" class="select-input" @change="u.load()">
        <option value="">{{ t('table.organization') }}</option>
        <option v-for="o in u.orgs.value" :key="o.id" :value="o.id">{{ o.nombre }}</option>
      </select>
    </div>

    <p v-if="u.error.value" class="form-error" style="margin-bottom:16px">{{ u.error.value }}</p>

    <DataTable :columns="columns" :rows="u.rows.value" :loading="u.loading.value">
      <template #cell-fullName="{ row }">{{ row.nombre }} {{ row.apellido }}</template>
      <template #cell-estado="{ value }"><StatusBadge :status="value" /></template>
      <template #cell-organizacion="{ row }">{{ row.organizacion?.nombre ?? '—' }}</template>
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
            <label>{{ t('table.organization') }}</label>
            <select v-model="u.form.value.organizacion_id" class="select-input">
              <option value="">—</option>
              <option v-for="o in u.orgs.value" :key="o.id" :value="o.id">{{ o.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('table.status') }}</label>
            <select v-model="u.form.value.estado" class="select-input">
              <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('users.password') }}</label>
            <input v-model="u.form.value.password" type="password" required />
          </div>
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
        <div class="form-group">
          <label>{{ t('users.phone') }}</label>
          <input v-model="u.form.value.telefono" type="tel" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('table.role') }}</label>
            <div class="field-readonly">{{ t(`roles.${u.form.value.rol}`) }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('table.organization') }}</label>
            <select v-model="u.form.value.organizacion_id" class="select-input">
              <option value="">—</option>
              <option v-for="o in u.orgs.value" :key="o.id" :value="o.id">{{ o.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('table.status') }}</label>
            <select v-model="u.form.value.estado" class="select-input">
              <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('users.newPassword') }}</label>
            <input v-model="u.form.value.password" type="password" />
          </div>
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
