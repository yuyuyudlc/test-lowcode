<template>
  <div class="radio-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-radio-group v-model="selectedValue" @change="handleChange">
      <el-radio v-for="option in options" :key="option.value" :label="option.value" :disabled="disabled">
        {{ option.label }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
    default: '请选择正确答案'
  },
  options: {
    type: Array,
    default: () => [
      { label: '选项A', value: 'A' },
      { label: '选项B', value: 'B' },
      { label: '选项C', value: 'C' },
      { label: '选项D', value: 'D' }
    ]
  },
  required: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const selectedValue = ref('')

const handleChange = (value) => {
  emit('change', value)
}
</script>

<style scoped>
.radio-question {
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

.el-radio {
  display: block;
  margin-bottom: 8px;
}
</style>
