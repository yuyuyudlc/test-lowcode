<template>
  <div class="checkbox-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-checkbox-group v-model="selectedValues" @change="handleChange" :max="max">
      <el-checkbox v-for="option in options" :key="option.value" :label="option.value" :disabled="disabled">
        {{ option.label }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '这是一道多选题'
  },
  description: {
    type: String,
    default: '可选择多个答案'
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
  },
  max: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['change'])

const selectedValues = ref([])

const handleChange = (value) => {
  emit('change', value)
}
</script>

<style scoped>
.checkbox-question {
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

.el-checkbox {
  display: block;
  margin-bottom: 8px;
}
</style>
