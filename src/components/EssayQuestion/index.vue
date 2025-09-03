<template>
  <div class="essay-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-input v-model="essayValue" type="textarea" :placeholder="placeholder" :disabled="disabled" :rows="rows"
      :maxlength="maxlength" :show-word-limit="showWordLimit" :resize="resize" @change="handleChange"
      @input="handleInput" />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '这是一道问答题'
  },
  description: {
    type: String,
    default: '请详细阐述您的观点'
  },
  placeholder: {
    type: String,
    default: '请详细回答问题...'
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
    default: 4
  },
  maxlength: {
    type: Number,
    default: 1000
  },
  showWordLimit: {
    type: Boolean,
    default: true
  },
  resize: {
    type: String,
    default: 'vertical'
  }
})

const emit = defineEmits(['change', 'input'])

const essayValue = ref('')

const handleChange = (value) => {
  emit('change', value)
}

const handleInput = (value) => {
  emit('input', value)
}
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
