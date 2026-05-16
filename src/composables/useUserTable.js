import { ref, onMounted } from 'vue'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuarios'
import { getOrganizaciones } from '../services/organizaciones'

export function useUserTable(options = {}) {
  const { showOrgFilter = true } = options

  const rows       = ref([])
  const orgs       = ref([])
  const loading    = ref(false)
  const error      = ref('')
  const page       = ref(1)
  const lastPage   = ref(1)
  const total      = ref(0)

  const search      = ref('')
  const filterRol   = ref('')
  const filterEstado = ref('')
  const filterOrg   = ref('')

  const showCreate  = ref(false)
  const showEdit    = ref(false)
  const showDelete  = ref(false)
  const selected    = ref(null)
  const formLoading = ref(false)
  const formError   = ref('')

  const emptyForm = () => ({
    nombre: '', apellido: '', email: '', telefono: '',
    rol: 'cliente', organizacion_id: '', estado: 'activo', password: '',
  })
  const form = ref(emptyForm())

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const params = { page: page.value }
      if (search.value)       params.buscar        = search.value
      if (filterRol.value)    params.rol            = filterRol.value
      if (filterEstado.value) params.estado         = filterEstado.value
      if (filterOrg.value)    params.organizacion_id = filterOrg.value

      const res     = await getUsuarios(params)
      rows.value    = res.data    ?? res
      total.value   = res.total   ?? rows.value.length
      lastPage.value = res.last_page ?? 1
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadOrgs() {
    try {
      const res = await getOrganizaciones()
      orgs.value = res.data ?? res
    } catch {}
  }

  function openCreate() {
    form.value = emptyForm()
    formError.value = ''
    showCreate.value = true
  }

  function openEdit(row) {
    selected.value = row
    form.value = { ...row, password: '' }
    formError.value = ''
    showEdit.value = true
  }

  function openDelete(row) {
    selected.value = row
    showDelete.value = true
  }

  async function handleCreate() {
    formLoading.value = true
    formError.value = ''
    try {
      await createUsuario(form.value)
      showCreate.value = false
      await load()
    } catch (e) {
      formError.value = e.message
    } finally {
      formLoading.value = false
    }
  }

  async function handleEdit() {
    formLoading.value = true
    formError.value = ''
    try {
      await updateUsuario(selected.value.id, form.value)
      showEdit.value = false
      await load()
    } catch (e) {
      formError.value = e.message
    } finally {
      formLoading.value = false
    }
  }

  async function handleDelete() {
    try {
      await deleteUsuario(selected.value.id)
      showDelete.value = false
      await load()
    } catch (e) {
      error.value = e.message
    }
  }

  function onSearch(q) { search.value = q; page.value = 1; load() }
  function onPage(p)   { page.value = p; load() }

  onMounted(() => {
    load()
    if (showOrgFilter) loadOrgs()
  })

  return {
    rows, orgs, loading, error, page, lastPage, total,
    search, filterRol, filterEstado, filterOrg,
    showCreate, showEdit, showDelete, selected, form, formLoading, formError,
    load, openCreate, openEdit, openDelete, handleCreate, handleEdit, handleDelete,
    onSearch, onPage, showOrgFilter,
  }
}
