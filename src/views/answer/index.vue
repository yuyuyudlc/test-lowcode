<template>
  <div class="answer-layout">
    <!-- 顶部工具栏 -->
    <div class="topbar">
      <div class="title">问卷预览</div>
      <div class="actions">
        <el-button @click="triggerFileInput" type="primary" icon="Upload">加载问卷</el-button>
        <el-button @click="submitAnswers" type="success" icon="Check" :disabled="!hasComponents">提交答案</el-button>
        <el-button @click="resetAnswers" type="warning" icon="Refresh" :disabled="!hasComponents">重置</el-button>
      </div>
      <!-- 隐藏的文件选择器 -->
      <input ref="fileInput" type="file" accept=".json" @change="handleFileImport" style="display: none;" />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div v-if="!hasComponents" class="empty-state">
        <el-empty description="请加载问卷文件">
          <el-button type="primary" @click="triggerFileInput">加载问卷</el-button>
        </el-empty>
      </div>

      <div v-else class="question-container" ref="mainContainer" :style="{ height: containerHeight + 'px' }">
        <!-- 渲染所有组件 -->
        <div v-for="component in components" :key="component.id" class="question-item" :style="{
          position: 'absolute',
          top: component.top + 'px',
          left: component.left + 'px',
          ...component.style
        }">
          <!-- 使用动态组件渲染 -->
          <component :is="component.type" v-bind="getComponentProps(component)"
            v-model="answers[component.props?.title || `组件${component.id}`]" @click="handleComponentClick(component)" />
        </div>
      </div>
    </div>

    <!-- 答案预览面板 -->
    <div v-if="hasComponents" class="answer-panel">
      <div class="panel-header">
        <h3>答案预览</h3>
        <el-button @click="showAnswerPanel = !showAnswerPanel" type="text" icon="View">
          {{ showAnswerPanel ? '隐藏' : '显示' }}
        </el-button>
      </div>
      <div v-if="showAnswerPanel" class="panel-content">
        <div v-for="(answer, answerKey) in answers" :key="answerKey" class="answer-item">
          <div class="answer-label">
            {{ answerKey }}:
          </div>
          <div class="answer-value">
            {{ formatAnswerValue(answer) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  ElButton,
  ElEmpty,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/empty/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { importComponentsFromJson } from '@/ultils/jsonUtils'

// 组件数据
const components = ref([])
const answers = reactive({})
const fileInput = ref(null)
const showAnswerPanel = ref(true)

// 计算属性
const hasComponents = computed(() => components.value.length > 0)

// 计算容器高度：组件最大top值 + 500px
const containerHeight = computed(() => {
  if (components.value.length === 0) return 600

  const maxTop = Math.max(...components.value.map(component => component.top || 0))
  return maxTop + 500
})

// 获取组件的 props，包括答题相关的属性
function getComponentProps(component) {
  const props = { ...component.props }

  // 对于表单组件，添加答题相关的事件处理
  if (needsAnswer(component.type)) {
    const answerKey = component.props?.title || `组件${component.id}`
    props.onUpdate = (value) => {
      answers[answerKey] = value
    }
  }

  return props
}

// 获取组件标签（现在直接返回answerKey，因为key就是title）
function getComponentLabel(answerKey) {
  return answerKey
}

// 初始化答案数据
function initAnswers() {
  // 清空现有答案
  Object.keys(answers).forEach(key => {
    delete answers[key]
  })

  // 为每个组件初始化答案
  components.value.forEach(component => {
    const answerKey = component.props?.title || `组件${component.id}`
    if (component.type === 'BaseCheckbox') {
      answers[answerKey] = []
    } else if (needsAnswer(component.type)) {
      // 其他需要答案的组件初始化为空字符串
      answers[answerKey] = ''
    }
  })
}

// 判断组件是否需要答案
function needsAnswer(componentType) {
  const answerTypes = ['BaseInput', 'BaseRadio', 'BaseCheckbox', 'BaseSelect']
  return answerTypes.includes(componentType)
}

// 触发文件选择
function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件导入
async function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const result = await importComponentsFromJson(file)
    if (result.success) {
      components.value = result.components
      initAnswers()
      ElMessage.success('问卷加载成功！')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败: ' + error.message)
  }

  // 清空文件选择器
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 格式化答案值
function formatAnswerValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '未选择'
  }
  return value || '未填写'
}

// 提交答案
function submitAnswers() {
  // 验证必填项
  const requiredComponents = components.value.filter(c =>
    c.props && c.props.required && needsAnswer(c.type)
  )

  const missingAnswers = []

  requiredComponents.forEach(component => {
    const answer = answers[component.props.title]
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      missingAnswers.push(getComponentLabel(component.props.title))
    }
  })

  if (missingAnswers.length > 0) {
    ElMessage.warning(`请填写必填项: ${missingAnswers.join(', ')}`)
    return
  }

  // 整理答案数据
  const answerData = {
    timestamp: new Date().toISOString(),
    answers: { ...answers }
  }

  // 这里可以发送到后端或者下载为文件
  console.log('提交的答案:', answerData)

  ElMessageBox.alert(
    `<pre>${JSON.stringify(answerData, null, 2)}</pre>`,
    '提交成功',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 重置答案
function resetAnswers() {
  ElMessageBox.confirm('确定要重置所有答案吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    initAnswers()
    ElMessage.success('答案已重置')
  }).catch(() => {
    // 用户取消
  })
}

// 处理组件点击事件
function handleComponentClick(component) {
  if (component.type === 'BaseButton') {
    ElMessage.info(`点击了按钮: ${component.props?.text || '按钮'}`)
  }
}
</script>

<style scoped>
.answer-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.actions {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  position: relative;
  overflow: auto;
  padding: 24px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.question-container {
  position: relative;
  min-height: 600px;
  /* 移除 height: 100%，现在通过 :style 动态设置 */
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-item {
  margin-bottom: 24px;
}

.answer-panel {
  position: fixed;
  right: 0;
  top: 70px;
  bottom: 0;
  width: 300px;
  background: white;
  border-left: 1px solid #e8e8e8;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.panel-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 120px);
}

.answer-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.answer-label {
  font-weight: 500;
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
}

.answer-value {
  color: #333;
  font-size: 14px;
  word-break: break-word;
}
</style>
