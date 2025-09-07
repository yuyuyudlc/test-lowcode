<template>
  <div class="radio-question">
    <div class="question-title">{{ title }}</div>
    <div class="question-description" v-if="description">{{ description }}</div>
    <el-radio-group v-model="selectedValue" @change="handleChange" :disabled="disabled">
      <el-radio v-for="option in options" :key="option.value" :label="option.value">
        {{ option.label }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 添加 modelValue prop 用于 v-model
  modelValue: {
    type: [String, Number],
    default: ''
  },
  title: {
    type: String,
    default: '这是一道单选题'
  },
  description: {
    type: String,
    default: '请选择一个答案'
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

// 添加 update:modelValue 事件用于 v-model
const emit = defineEmits(['change', 'update:modelValue'])

// 使用 props.modelValue 初始化本地状态
const selectedValue = ref(props.modelValue)

const handleChange = (value) => {
  // 同时触发两个事件
  emit('change', value)
  emit('update:modelValue', value)
}

// 监听外部 modelValue 变化，同步到内部状态
watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue
  }
)
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
