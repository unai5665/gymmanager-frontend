<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  columns: { type: Array, required: true },
  rows:    { type: Array, required: true },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>

      <tbody v-if="loading">
        <tr>
          <td :colspan="columns.length" class="table-state">
            <span class="spinner" />
          </td>
        </tr>
      </tbody>

      <tbody v-else-if="rows.length === 0">
        <tr>
          <td :colspan="columns.length" class="table-state table-empty">
            {{ t('table.noResults') }}
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ col.render ? col.render(row) : (row[col.key] ?? '—') }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
