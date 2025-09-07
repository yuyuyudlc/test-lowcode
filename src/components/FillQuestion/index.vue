<template>
  <div class="fill-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-input v-model="inputValue" @input="handleInput" @change="handleChange" :placeholder="placeholder"
      :disabled="disabled" :type="inputType" :maxlength="maxLength" :show-word-limit="showWordLimit" :rows="rows"
      :autosize="autosize" />
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
    default: '这是一道填空题'
  },
  description: {
    type: String,
    default: '请填写您的答案'
  },
  placeholder: {
    type: String,
    default: '请输入答案...'
  },
  required: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  inputType: {
    type: String,
    default: 'text', // text, textarea, password, number 等
    validator: (value) => ['text', 'textarea', 'password', 'number', 'email', 'url'].includes(value)
  },
  maxLength: {
    type: Number,
    default: null
  },
  showWordLimit: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  },
  autosize: {
    type: [Boolean, Object],
    default: false
  }
})

// 添加 update:modelValue 事件用于 v-model
const emit = defineEmits(['change', 'input', 'update:modelValue'])

// 使用 props.modelValue 初始化本地状态
const inputValue = ref(props.modelValue)

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
    inputValue.value = newValue
  }
)
</script>

<style scoped>
.fill-question {
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
