<template>
  <div class="fill-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-input v-model="inputValue" :placeholder="placeholder" :disabled="disabled" :maxlength="maxlength"
      :show-word-limit="showWordLimit" :clearable="clearable" @change="handleChange" @input="handleInput" />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '这是一道填空题'
  },
  description: {
    type: String,
    default: '请填写正确答案'
  },
  placeholder: {
    type: String,
    default: '请输入答案'
  },
  required: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number,
    default: 100
  },
  showWordLimit: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['change', 'input'])

const inputValue = ref('')

const handleChange = (value) => {
  emit('change', value)
}

const handleInput = (value) => {
  emit('input', value)
}
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
