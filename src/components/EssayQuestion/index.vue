<template>
  <div class="essay-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-input v-model="essayValue" @input="handleInput" @change="handleChange" type="textarea"
      :placeholder="placeholder" :disabled="disabled" :rows="rows" :maxlength="maxLength"
      :show-word-limit="showWordLimit" :autosize="autosize" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 添加 modelValue prop 用于 v-model
  modelValue: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '这是一道问答题'
  },
  description: {
    type: String,
    default: '请详细描述您的观点或答案'
  },
  placeholder: {
    type: String,
    default: '请在此输入您的详细答案...'
  },
  required: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 6
  },
  maxLength: {
    type: Number,
    default: 1000
  },
  showWordLimit: {
    type: Boolean,
    default: true
  },
  autosize: {
    type: [Boolean, Object],
    default: { minRows: 4, maxRows: 10 }
  }
})

// 添加 update:modelValue 事件用于 v-model
const emit = defineEmits(['change', 'input', 'update:modelValue'])

// 使用 props.modelValue 初始化本地状态
const essayValue = ref(props.modelValue)

const handleInput = (value) => {
  emit('input', value)
  emit('update:modelValue', value)
}

const handleChange = (value) => {
  emit('change', value)
  emit('update:modelValue', value)
}

// 监听外部 modelValue 变化，同步到内部状态
watch(
  () => props.modelValue,
  (newValue) => {
    essayValue.value = newValue
  }
)
</script>

<style scoped>
.essay-question {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 16px;
}

.question-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.question-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}
</style>
