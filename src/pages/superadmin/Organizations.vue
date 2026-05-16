<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getOrganizaciones, createOrganizacion, updateOrganizacion, deleteOrganizacion } from '../../services/organizaciones'
import DataTable     from '../../components/DataTable.vue'
import StatusBadge   from '../../components/StatusBadge.vue'
import DropdownMenu  from '../../components/DropdownMenu.vue'
import SearchBar     from '../../components/SearchBar.vue'
import Pagination    from '../../components/Pagination.vue'
import Modal         from '../../components/Modal.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

const { t } = useI18n()

const rows       = ref([])
const loading    = ref(false)
const error      = ref('')
const page       = ref(1)
const lastPage   = ref(1)
const search     = ref('')
const filterEstado = ref('')

const showCreate  = ref(false)
const showEdit    = ref(false)
const showDelete  = ref(false)
const selected    = ref(null)
const formLoading = ref(false)
const formError   = ref('')

const emptyForm = () => ({ nombre: '', estado: 'activa' })
const form = ref(emptyForm())

const ESTADOS = ['activa', 'inactiva']

const columns = computed(() => [
  { key: 'nombre',  label: t('organizations.name') },
  { key: 'estado',  label: t('table.status') },
  { key: 'actions', label: '' },
])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = { page: page.value }
    if (search.value)       params.buscar = search.value
    if (filterEstado.value) params.estado = filterEstado.value
    const res = await getOrganizaciones(params)
    rows.value     = res.data      ?? res
    lastPage.value = res.last_page ?? 1
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)

function onSearch(q) { search.value = q; page.value = 1; load() }
function onPage(p)   { page.value = p; load() }

function openCreate()  { form.value = emptyForm(); formError.value = ''; showCreate.value = true }
function openEdit(row) { selected.value = row; form.value = { ...row }; formError.value = ''; showEdit.value = true }
function openDelete(row) { selected.value = row; showDelete.value = true }

async function handleCreate() {
  formLoading.value = true; formError.value = ''
  try { await createOrganizacion(form.value); showCreate.value = false; await load() }
  catch (e) { formError.value = e.message }
  finally { formLoading.value = false }
}

async function handleEdit() {
  formLoading.value = true; formError.value = ''
  try { await updateOrganizacion(selected.value.id, form.value); showEdit.value = false; await load() }
  catch (e) { formError.value = e.message }
  finally { formLoading.value = false }
}

async function handleDelete() {
  try { await deleteOrganizacion(selected.value.id); showDelete.value = false; await load() }
  catch (e) { error.value = e.message }
}

function getActions(row) {
  return [
    { label: t('actions.edit'),   action: () => openEdit(row) },
    { label: t('actions.delete'), action: () => openDelete(row), variant: 'danger' },
  ]
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ t('organizations.title') }}</h1>
      <button class="btn-primary btn-sm" @click="openCreate()">+ {{ t('organizations.create') }}</button>
    </div>

    <div class="filters-bar">
      <SearchBar @search="onSearch" />
      <select v-model="filterEstado" class="select-input" @change="load()">
        <option value="">{{ t('status.all') }}</option>
        <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
      </select>
    </div>

    <p v-if="error" class="form-error" style="margin-bottom:16px">{{ error }}</p>

    <DataTable :columns="columns" :rows="rows" :loading="loading">
      <template #cell-estado="{ value }"><StatusBadge :status="value" /></template>
      <template #cell-actions="{ row }"><DropdownMenu :items="getActions(row)" /></template>
    </DataTable>

    <Pagination :current-page="page" :last-page="lastPage" @change="onPage" />

    <!-- Create -->
    <Modal :show="showCreate" :title="t('organizations.create')" size="sm" @close="showCreate = false">
      <form class="modal-form" @submit.prevent="handleCreate()">
        <div class="form-group">
          <label>{{ t('organizations.name') }}</label>
          <input v-model="form.nombre" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ t('table.status') }}</label>
          <select v-model="form.estado" class="select-input">
            <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
          </select>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showCreate = false">{{ t('actions.cancel') }}</button>
          <button type="submit" class="btn-primary btn-sm" :disabled="formLoading">
            {{ formLoading ? t('common.loading') : t('actions.create') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit -->
    <Modal :show="showEdit" :title="t('organizations.edit')" size="sm" @close="showEdit = false">
      <form class="modal-form" @submit.prevent="handleEdit()">
        <div class="form-group">
          <label>{{ t('organizations.name') }}</label>
          <input v-model="form.nombre" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ t('table.status') }}</label>
          <select v-model="form.estado" class="select-input">
            <option v-for="s in ESTADOS" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
          </select>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showEdit = false">{{ t('actions.cancel') }}</button>
          <button type="submit" class="btn-primary btn-sm" :disabled="formLoading">
            {{ formLoading ? t('common.loading') : t('common.save') }}
          </button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :show="showDelete"
      :title="t('organizations.delete')"
      :message="t('organizations.deleteConfirm')"
      @confirm="handleDelete()"
      @cancel="showDelete = false"
    />
  </div>
</template>
