<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiGet } from '../../services/api'
import Modal from '../../components/Modal.vue'

const { t } = useI18n()

const racha   = ref(null)
const loading = ref(true)
const error   = ref('')

const showProtectors = ref(false)
const showMaxStreak  = ref(false)
const showTips       = ref(false)

const protectorData  = ref(null)
const recuperaciones = ref([])
const loadingProt    = ref(false)

const motivational = computed(() => {
  const n = racha.value?.racha_actual ?? 0
  if (n === 0)  return t('racha.msg.start')
  if (n === 1)  return t('racha.msg.first')
  if (n === 10) return t('racha.msg.ten')
  if (n === 30) return t('racha.msg.month')
  if (n > 30)   return t('racha.msg.beast', { n })
  return t('racha.msg.generic', { n })
})

const tips = computed(() => [
  t('racha.tip1'), t('racha.tip2'), t('racha.tip3'),
  t('racha.tip4'), t('racha.tip5'), t('racha.tip6'),
])

async function load() {
  loading.value = true
  try {
    racha.value = await apiGet('/racha')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function openProtectors() {
  showProtectors.value = true
  if (protectorData.value !== null) return
  loadingProt.value = true
  try {
    const [p, r] = await Promise.all([
      apiGet('/protectores'),
      apiGet('/protectores/recuperaciones'),
    ])
    protectorData.value  = p
    recuperaciones.value = r
  } catch {}
  loadingProt.value = false
}

function formatDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split(/[-T]/). map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function daysUntil(dateStr) {
  if (!dateStr) return 0
  const [y, m, d] = dateStr.split(/[-T]/).map(Number)
  const target = new Date(y, m - 1, d)
  const today  = new Date(); today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((target - today) / 86400000))
}

const pendingRecoveries = computed(() =>
  recuperaciones.value.filter(r => !r.recuperado)
)

onMounted(load)
</script>

<template>
  <div class="page">
    <div v-if="loading" class="dashboard-loading"><span class="spinner" /></div>
    <p v-if="error" class="form-error">{{ error }}</p>

    <template v-if="racha && !loading">
      <div class="racha-hero">
        <p class="racha-motivational">{{ motivational }}</p>
        <div class="racha-counter">
          <span class="racha-number">{{ racha.racha_actual }}</span>
          <span class="racha-label">{{ t('racha.days') }}</span>
        </div>
      </div>

      <div class="racha-actions">
        <button class="btn-racha-action" @click="openProtectors">
          {{ t('racha.protectors') }}
        </button>
        <button class="btn-racha-action" @click="showMaxStreak = true">
          {{ t('racha.maxStreak') }}
        </button>
        <button class="btn-racha-action" @click="showTips = true">
          {{ t('racha.tips') }}
        </button>
      </div>
    </template>

    <!-- Protectors modal -->
    <Modal :show="showProtectors" :title="t('racha.protectorsTitle')" size="sm" @close="showProtectors = false">
      <div v-if="loadingProt" style="text-align:center;padding:24px"><span class="spinner" /></div>
      <template v-else-if="protectorData">
        <div class="protector-slots">
          <span
            v-for="i in protectorData.max_protectores"
            :key="i"
            class="protector-dot"
            :class="i <= protectorData.protectores_disponibles ? 'protector-dot--active' : 'protector-dot--empty'"
          />
        </div>
        <p class="protector-count">
          {{ protectorData.protectores_disponibles }} / {{ protectorData.max_protectores }}
          {{ t('racha.available') }}
        </p>

        <div v-if="pendingRecoveries.length === 0" class="protector-empty">
          {{ t('racha.noConsumed') }}
        </div>
        <div v-else class="recovery-list">
          <div v-for="r in pendingRecoveries" :key="r.id" class="recovery-item">
            <div class="recovery-row">
              <span class="recovery-label">{{ t('racha.lostOn') }}</span>
              <span>{{ formatDate(r.perdido_en) }}</span>
            </div>
            <div class="recovery-row">
              <span class="recovery-label">{{ t('racha.recoversOn') }}</span>
              <span>{{ formatDate(r.fecha_recuperacion) }}</span>
            </div>
            <div class="recovery-row">
              <span class="recovery-label">{{ t('racha.daysLeft') }}</span>
              <span class="recovery-days">{{ daysUntil(r.fecha_recuperacion) }}d</span>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Max streak modal -->
    <Modal :show="showMaxStreak" :title="t('racha.maxStreakTitle')" size="sm" @close="showMaxStreak = false">
      <div class="max-streak-display">
        <span class="max-streak-number">{{ racha?.racha_maxima ?? 0 }}</span>
        <span class="max-streak-label">{{ t('racha.days') }}</span>
      </div>
    </Modal>

    <!-- Tips modal -->
    <Modal :show="showTips" :title="t('racha.tipsTitle')" size="sm" @close="showTips = false">
      <ul class="tips-list">
        <li v-for="(tip, i) in tips" :key="i">{{ tip }}</li>
      </ul>
    </Modal>
  </div>
</template>
