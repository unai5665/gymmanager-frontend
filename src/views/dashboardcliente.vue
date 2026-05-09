<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard, marcarAsistencia } from '@/services/dashboard'
import { getUser } from '@/services/auth'

const data = ref(null)
const user = getUser()

async function loadDashboard() {
  try {
    data.value = await getDashboard()
  } catch (err) {
    console.error(err)
  }
}

async function marcar(completado) {
  try {
    await marcarAsistencia(completado)
    await loadDashboard()
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="dashboard">

    <!-- HEADER -->
    <header class="header">
      <h1>GymManager</h1>

      <p v-if="user">
        Hola, {{ user.nombre }} 👋
      </p>

      <nav v-if="data">
        <span>🔥 Racha: {{ data.racha }}</span>
        <span>📅 Rutina: {{ data.rutina }}</span>
        <span>🎯 Objetivos</span>
        <span>👤 Perfil</span>
      </nav>
    </header>

    <!-- CONTENIDO -->
    <main v-if="data">

      <h2 v-if="data.es_descanso">
        Hoy es descanso 💆
      </h2>

      <h2 v-else>
        ¿Ya has ido al gym hoy? 💪
      </h2>

      <!-- BOTONES -->
      <div v-if="data.puede_marcar && !data.es_descanso">

        <button @click="marcar(true)">
          ✔ Ya fui
        </button>

        <button @click="marcar(false)">
          ❌ No voy
        </button>

      </div>

      <p v-if="!data.puede_marcar && !data.es_descanso">
        Día cerrado ⛔
      </p>

      <p v-if="data.es_descanso">
        No afecta tu racha 👍
      </p>

    </main>

  </div>
</template>

<style>
.dashboard {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>