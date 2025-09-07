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
import { ref, watch } from 'vue'

const props = defineProps({
  // 添加 modelValue prop 用于 v-model
  modelValue: {
    type: Array,
    default: () => []
  },
  max: {
    type: Number,
    default: 3
  },
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
})

const emit = defineEmits(['change', 'update:modelValue'])


const selectedValues = ref([...props.modelValue])

const handleChange = (value) => {

  emit('change', value)
  emit('update:modelValue', value)
}

// 监听外部 modelValue 变化，同步到内部状态
watch(
  () => props.modelValue,
  (newValue) => {
    selectedValues.value = [...newValue]
  },
  { deep: true }
)
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
