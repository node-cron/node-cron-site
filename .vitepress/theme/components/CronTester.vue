<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { toHuman, toCron, CronTranslateError } from 'cron-translate'

const cronExamples = [
  '0 0 9 * * *',
  '0 */5 * * * *',
  '0 0 18 * * 1-5',
  '0 30 9 * * 1',
  '0 0 0 1 * *',
  '0 0 0 * * 5L',
  '0 0 9 * * 1#1',
  '0 0 0 * * 0,6',
]

const englishExamples = [
  'every day at 9am',
  'every 5 minutes',
  'every weekday at 6pm',
  'last friday of the month',
  'every weekend',
  'first monday of the month at 9am',
]

const fieldNames = ['second', 'minute', 'hour', 'day of month', 'month', 'day of week']

const mode = ref('cron') // 'cron' = cron -> English, 'english' = English -> cron

const cronInput = ref('0 0 9 * * 1-5')
const englishInput = ref('every weekday at 6pm')

function translate(fn, value) {
  const trimmed = value.trim()
  if (!trimmed) return { ok: null }
  try {
    return { ok: true, result: fn(trimmed) }
  } catch (err) {
    if (err instanceof CronTranslateError) {
      return { ok: false, message: err.message, hint: err.hint }
    }
    return { ok: false, message: err.message || 'Could not translate that input.' }
  }
}

const cronOutput = computed(() => translate(toHuman, cronInput.value))
const englishOutput = computed(() => translate(toCron, englishInput.value))

// Field breakdown for the cron -> English direction
const fields = computed(() => {
  const parts = cronInput.value.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 5 || parts.length > 6) return null
  const padded = parts.length === 5 ? ['0', ...parts] : parts
  return padded.map((value, i) => ({ name: fieldNames[i], value }))
})

function useCronExample(value) {
  mode.value = 'cron'
  cronInput.value = value
}

function useEnglishExample(value) {
  mode.value = 'english'
  englishInput.value = value
}

// --- Shareable URL: ?c=<cron> opens cron mode, ?t=<text> opens English mode ---

// Whether to mirror state into the URL. Stays false until the initial query has
// been read, so we never overwrite an incoming link before applying it.
const syncing = ref(false)

function buildQuery() {
  const params = new URLSearchParams()
  if (mode.value === 'cron') {
    if (cronInput.value.trim()) params.set('c', cronInput.value.trim())
  } else {
    if (englishInput.value.trim()) params.set('t', englishInput.value.trim())
  }
  const qs = params.toString()
  return window.location.pathname + (qs ? `?${qs}` : '')
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const c = params.get('c')
  const t = params.get('t')
  if (c !== null) {
    mode.value = 'cron'
    cronInput.value = c
  } else if (t !== null) {
    mode.value = 'english'
    englishInput.value = t
  }
  // Start mirroring after the incoming params (if any) are applied.
  nextTick(() => { syncing.value = true })

  watch([mode, cronInput, englishInput], () => {
    if (!syncing.value) return
    const url = buildQuery() + window.location.hash
    window.history.replaceState(window.history.state, '', url)
  })
})

const copied = ref(false)
let copyTimer

async function copyLink() {
  const url = window.location.origin + buildQuery()
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = false }, 1800)
}
</script>

<template>
  <div class="cron-tester">
    <div class="ct-tabs" role="tablist">
      <button
        class="ct-tab"
        :class="{ active: mode === 'cron' }"
        role="tab"
        :aria-selected="mode === 'cron'"
        @click="mode = 'cron'"
      >Cron → English</button>
      <button
        class="ct-tab"
        :class="{ active: mode === 'english' }"
        role="tab"
        :aria-selected="mode === 'english'"
        @click="mode = 'english'"
      >English → Cron</button>
    </div>

    <!-- Cron -> English -->
    <div v-if="mode === 'cron'" class="ct-panel">
      <label class="ct-label" for="ct-cron-input">Cron expression</label>
      <input
        id="ct-cron-input"
        v-model="cronInput"
        class="ct-input ct-mono"
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="0 0 9 * * 1-5"
      />

      <div v-if="cronOutput.ok === true" class="ct-result ct-result--ok">
        <span class="ct-result-label">Means</span>
        <p class="ct-result-text">{{ cronOutput.result }}</p>
      </div>
      <div v-else-if="cronOutput.ok === false" class="ct-result ct-result--error">
        <span class="ct-result-label">Invalid expression</span>
        <p class="ct-result-text">{{ cronOutput.message }}</p>
        <p v-if="cronOutput.hint" class="ct-hint">{{ cronOutput.hint }}</p>
      </div>
      <div v-else class="ct-result ct-result--empty">
        <p class="ct-result-text">Type a cron expression above to see what it means.</p>
      </div>

      <div v-if="fields" class="ct-fields">
        <div v-for="field in fields" :key="field.name" class="ct-field">
          <span class="ct-field-value ct-mono">{{ field.value }}</span>
          <span class="ct-field-name">{{ field.name }}</span>
        </div>
      </div>

      <div class="ct-examples">
        <span class="ct-examples-label">Try one:</span>
        <button
          v-for="ex in cronExamples"
          :key="ex"
          class="ct-chip ct-mono"
          @click="useCronExample(ex)"
        >{{ ex }}</button>
      </div>
    </div>

    <!-- English -> Cron -->
    <div v-else class="ct-panel">
      <label class="ct-label" for="ct-english-input">Plain English</label>
      <input
        id="ct-english-input"
        v-model="englishInput"
        class="ct-input"
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="every weekday at 6pm"
      />

      <div v-if="englishOutput.ok === true" class="ct-result ct-result--ok">
        <span class="ct-result-label">Cron expression</span>
        <p class="ct-result-text ct-mono ct-result-text--cron">{{ englishOutput.result }}</p>
      </div>
      <div v-else-if="englishOutput.ok === false" class="ct-result ct-result--error">
        <span class="ct-result-label">Couldn't translate</span>
        <p class="ct-result-text">{{ englishOutput.message }}</p>
        <p v-if="englishOutput.hint" class="ct-hint">{{ englishOutput.hint }}</p>
      </div>
      <div v-else class="ct-result ct-result--empty">
        <p class="ct-result-text">Describe a schedule above to get a cron expression.</p>
      </div>

      <div class="ct-examples">
        <span class="ct-examples-label">Try one:</span>
        <button
          v-for="ex in englishExamples"
          :key="ex"
          class="ct-chip"
          @click="useEnglishExample(ex)"
        >{{ ex }}</button>
      </div>
    </div>

    <div class="ct-share">
      <button class="ct-share-btn" @click="copyLink">
        <span v-if="copied">Link copied!</span>
        <span v-else>Copy shareable link</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cron-tester {
  margin: 24px 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.ct-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.ct-tab {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  transition: background-color 0.2s, color 0.2s;
}

.ct-tab:hover {
  color: var(--vp-c-text-1);
}

.ct-tab.active {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.ct-panel {
  padding: 20px;
}

.ct-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.ct-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
}

.ct-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.ct-mono {
  font-family: var(--vp-font-family-mono);
}

.ct-result {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.ct-result-label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-bottom: 6px;
}

.ct-result-text {
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.ct-result-text--cron {
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.ct-result--ok {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.ct-result--error {
  border-color: var(--vp-c-danger-1, #e05252);
  background: color-mix(in srgb, var(--vp-c-danger-1, #e05252) 8%, transparent);
}

.ct-result--empty {
  border-style: dashed;
}

.ct-result--empty .ct-result-text {
  font-size: 15px;
  color: var(--vp-c-text-3);
}

.ct-hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.ct-fields {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-top: 16px;
}

.ct-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.ct-field-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.ct-field-name {
  font-size: 11px;
  text-align: center;
  color: var(--vp-c-text-3);
  line-height: 1.2;
}

.ct-examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.ct-examples-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.ct-chip {
  padding: 5px 10px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: border-color 0.2s, color 0.2s;
}

.ct-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.ct-share {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.ct-share-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s, color 0.2s;
}

.ct-share-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .ct-fields {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
