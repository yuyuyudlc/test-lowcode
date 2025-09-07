<template>
  <div class="editor-layout">
    <div class="sidebar">
      <div style="font-size: 1.5rem; margin: 10px;">组件列表</div>
      <div draggable="true" class="component-item" v-for="(item, index) in registerConfig.componentList" :key="index"
        @dragstart="handleDragStart(item)">
        <div class="itemcontainer">
          <span class="component-label">{{ item.label }}</span>
          <component :is="item.type" v-bind="item.props" />
          <div class="item-mask"></div>
        </div>
      </div>
    </div>
    <div class="topbar">
      <el-button @click="undo" :disabled="!canUndo" type="primary" icon="ArrowLeft">后退</el-button>
      <el-button @click="redo" :disabled="!canRedo" type="primary" icon="ArrowRight">前进</el-button>
      <!-- 一键布局按钮 -->
      <el-dropdown @command="handleLayoutCommand" trigger="click">
        <el-button type="warning" icon="Grid">
          一键布局<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="grid">网格布局</el-dropdown-item>
            <el-dropdown-item command="center">居中对齐</el-dropdown-item>
            <el-dropdown-item command="distribute-v">垂直分布</el-dropdown-item>
            <el-dropdown-item command="align-left">左对齐</el-dropdown-item>
            <el-dropdown-item command="align-right">右对齐</el-dropdown-item>
            <el-dropdown-item command="align-top">顶对齐</el-dropdown-item>
            <el-dropdown-item command="align-bottom">底对齐</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 导出导入按钮 -->
      <el-button @click="handleExport" type="success" icon="Download">导出JSON</el-button>
      <el-button @click="triggerFileInput" type="info" icon="Upload">导入JSON</el-button>
      <!-- 隐藏的文件选择器 -->
      <input ref="fileInput" type="file" accept=".json" @change="handleFileImport" style="display: none" />
    </div>
    <div class="main_wrap">
      <div class="main" ref="mainRef" :style="{ height: canvasHeight + 'px' }" @dragover.prevent @drop="handleDrop"
        @click="handleMainClick">
        <!-- 辅助线渲染 -->
        <div v-for="(guide, idx) in guides" :key="idx" :class="['guide-line', guide.type]" :style="guide.type === 'vertical'
          ? { left: guide.position + 'px' }
          : { top: guide.position + 'px' }
          "></div>
        <div class="comp" v-for="el in components" :key="el.id" :data-id="el.id" ref="compRefs"
          :class="{ selected: selectedIds.includes(el.id) }" :style="{
            position: 'absolute',
            top: el.top + 'px',
            left: el.left + 'px',
            ...el.style,
          }" @click.stop="selectComponent(el.id, $event)" @mousedown.stop="onCompMouseDown(el.id, $event)">
          <component :is="el.type" v-bind="el.props || {}" />
        </div>
      </div>
    </div>
    <div class="rightbar">
      <!-- 画布属性编辑面板 -->
      <div v-if="selectedIds.length === 0" class="canvas-panel">
        <h3>画布设置</h3>
        <div class="property-section">
          <div class="property-item">
            <label>画布高度：</label>
            <el-input-number v-model="canvasHeight"  :min="400" :max="5000" :step="50"
              size="small" style="width: 100%" />
          </div>
          <div class="property-item">
            <label>画布背景：</label>
            <el-color-picker v-model="canvasBackground" @change="onCanvasBackgroundChange" size="small" show-alpha />
          </div>
          <div class="property-item">
            <label>网格显示：</label>
            <el-switch v-model="showGrid" @change="onGridToggle" size="small" />
          </div>
        </div>
      </div>

      <!-- 属性编辑面板 -->
      <div v-else-if="selectedComponent" class="property-panel">
        <h3>属性编辑</h3>
        <div class="property-section">
          <h4>基础属性</h4>
          <div class="property-item">
            <label>组件类型：</label>
            <span>{{ selectedComponent.type }}</span>
          </div>
          <div class="property-item">
            <label>X坐标：</label>
            <el-input-number v-model="selectedComponent.left" @change="onPropertyChange" size="small" />
          </div>
          <div class="property-item">
            <label>Y坐标：</label>
            <el-input-number v-model="selectedComponent.top" @change="onPropertyChange" size="small" />
          </div>
        </div>

        <!-- 组件特有属性 -->
        <div class="property-section" v-if="componentProperties.length > 0">
          <h4>组件属性</h4>
          <div v-for="prop in componentProperties" :key="prop.name" class="property-item">
            <label>{{ prop.label }}：</label>
            <!-- 文本输入 -->
            <el-input v-if="prop.type === 'string'" v-model="selectedComponent.props[prop.name]"
              @input="onPropertyChange" size="small" :placeholder="prop.placeholder" />
            <!-- 数字输入 -->
            <el-input-number v-else-if="prop.type === 'number'" v-model="selectedComponent.props[prop.name]"
              @change="onPropertyChange" size="small" :min="prop.min" :max="prop.max" />
            <!-- 布尔值 -->
            <el-switch v-else-if="prop.type === 'boolean'" v-model="selectedComponent.props[prop.name]"
              @change="onPropertyChange" size="small" />
            <!-- 选择器 -->
            <el-select v-else-if="prop.type === 'select'" v-model="selectedComponent.props[prop.name]"
              @change="onPropertyChange" size="small" style="width: 100%">
              <el-option v-for="option in prop.options" :key="option.value" :label="option.label"
                :value="option.value" />
            </el-select>
            <!-- 选项数组 -->
            <div v-if="prop.type === 'optionArray'" class="option-array-editor">
              <div v-for="(opt, idx) in selectedComponent.props[prop.name]" :key="idx" class="option-item">
                <el-input v-model="opt.label" @input="onOptionChange(prop.name)" size="small" placeholder="选项文本"
                  style="width: 45%; margin-right: 8px" />
                <el-input v-model="opt.value" @input="onOptionChange(prop.name)" size="small" placeholder="选项值"
                  style="width: 45%; margin-right: 8px" />
                <el-button type="danger" icon="Delete" @click="removeOption(prop.name, idx)" circle size="small" />
              </div>
              <el-button type="primary" icon="Plus" @click="addOption(prop.name)" size="small"
                style="margin-top: 8px">添加选项</el-button>
            </div>
          </div>
        </div>

        <!-- 样式属性 -->
        <div class="property-section">
          <h4>样式属性</h4>
          <div class="property-item">
            <label>宽度：</label>
            <el-input v-model="selectedComponent.style.width" @input="onPropertyChange" size="small"
              placeholder="如: 200px, 50%, auto" />
          </div>
          <div class="property-item">
            <label>高度：</label>
            <el-input v-model="selectedComponent.style.height" @input="onPropertyChange" size="small"
              placeholder="如: 100px, auto" />
          </div>
          <div class="property-item">
            <label>背景色：</label>
            <el-color-picker v-model="selectedComponent.style.backgroundColor" @change="onPropertyChange"
              size="small" />
          </div>
          <div class="property-item">
            <label>字体大小：</label>
            <el-input v-model="selectedComponent.style.fontSize" @input="onPropertyChange" size="small"
              placeholder="如: 14px" />
          </div>
          <div class="property-item">
            <label>字体颜色：</label>
            <el-color-picker v-model="selectedComponent.style.color" @change="onPropertyChange" size="small" />
          </div>
          <div class="property-item">
            <label>边框：</label>
            <el-input v-model="selectedComponent.style.border" @input="onPropertyChange" size="small"
              placeholder="如: 1px solid #ccc" />
          </div>
          <div class="property-item">
            <label>圆角：</label>
            <el-input v-model="selectedComponent.style.borderRadius" @input="onPropertyChange" size="small"
              placeholder="如: 4px" />
          </div>
        </div>
      </div>
      <div v-else class="no-selection">
        <p>选择了多个组件</p>
        <p>批量操作功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import {
  ElButton,
  ElInputNumber,
  ElInput,
  ElSwitch,
  ElSelect,
  ElOption,
  ElColorPicker,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
} from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/switch/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/color-picker/style/css'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/icon/style/css'
import { registerConfig } from '@/ultils/register'
import componentPropsConfig from '@/ultils/componentPropsConfig'
import { exportComponentsToJson, importComponentsFromJson } from '@/ultils/jsonUtils'

// ====== 画布设置相关 ======
const mainRef = ref(null)
const canvasHeight = ref(1000)
const canvasBackground = ref('#ffffff')
const showGrid = ref(false)


// 画布背景变更
function onCanvasBackgroundChange() {
  if (mainRef.value) {
    mainRef.value.style.backgroundColor = canvasBackground.value
  }
}

// 网格显示切换
function onGridToggle() {
  if (mainRef.value) {
    if (showGrid.value) {
      mainRef.value.classList.add('show-grid')
    } else {
      mainRef.value.classList.remove('show-grid')
    }
  }
}

// ====== 历史记录相关 ======
const components = ref([])
const history = ref([JSON.stringify(components.value)])
const historyIndex = ref(0)

const canUndo = ref(false)
const canRedo = ref(false)

watch([historyIndex, history], () => {
  canUndo.value = historyIndex.value > 0
  canRedo.value = historyIndex.value < history.value.length - 1
})

// 记录历史
function pushHistory() {
  // 截断未来历史
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(JSON.stringify(components.value))
  historyIndex.value++
}

// 撤销
function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    components.value = JSON.parse(history.value[historyIndex.value])
  }
}

// 重做
function redo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    components.value = JSON.parse(history.value[historyIndex.value])
  }
}

// ====== sidebar拖动相关 ======
const dragItem = ref(null)
const dropInfo = ref({})
const selectedIds = ref([])
const dragMoveInfo = ref(null)
const isMove = ref(false)
const guides = ref([]) // 辅助线数组
const compRefs = ref([]) // 用于获取所有组件的 DOM

function handleDragStart(item) {
  dragItem.value = item
}

function handleDrop(e) {
  if (!dragItem.value) return
  const mainRect = e.currentTarget.getBoundingClientRect()
  const mouseTop = e.clientY - mainRect.top
  const mouseLeft = e.clientX - mainRect.left

  // 生成新组件数据，左上角在鼠标位置
  const newId = Date.now()
  const newComponent = {
    id: newId,
    type: dragItem.value.type,
    top: mouseTop,
    left: mouseLeft,
    props: { ...dragItem.value.props },
    style: { ...dragItem.value.style },
  }

  components.value.push(newComponent)

  dropInfo.value = { id: newId, mouseTop, mouseLeft }
  dragItem.value = null

  nextTick(() => {
    adjustComponentPosition()
    pushHistory()
  })
}

// 调整新组件位置，使其中心点在鼠标位置
function adjustComponentPosition() {
  const info = dropInfo.value
  if (!info.id) return
  const compEls = document.querySelectorAll('.main .comp')
  const lastCompEl = Array.from(compEls).find((el) => el.getAttribute('data-id') == info.id)
  if (lastCompEl) {
    const rect = lastCompEl.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const newTop = info.mouseTop - height / 2
    const newLeft = info.mouseLeft - width / 2
    const comp = components.value.find((c) => c.id === info.id)
    if (comp) {
      comp.top = newTop
      comp.left = newLeft
    }
  }
  dropInfo.value = {}
}

// ====== 编辑器区域拖动/选择相关 ======
// 多选逻辑：支持 Ctrl/Cmd 多选，单击则只选一个
function selectComponent(id, event) {
  if (event.ctrlKey || event.metaKey) {
    // 多选
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id)
    } else {
      if (isMove.value) {
        isMove.value = false
        return
      } // 拖动时不取消选中
      selectedIds.value = selectedIds.value.filter((i) => i !== id)
    }
  } else {
    if (isMove.value) {
      isMove.value = false
      return
    }
    selectedIds.value = [id]
  }
}

// 点击 main 区域的处理
function handleMainClick(e) {
  if (e.target.classList.contains('main')) {
    selectedIds.value = []
  }
}

// 组件拖动相关
function onCompMouseDown(id, event) {
  // 只有在未按住 Ctrl/Cmd 且当前组件未被选中时单选
  if (!selectedIds.value.includes(id)) {
    if (!(event.ctrlKey || event.metaKey)) {
      selectComponent(id, event)
    }
  }
  // 记录初始鼠标位置和所有选中组件的初始位置
  const startX = event.clientX
  const startY = event.clientY
  const selectedComps = components.value.filter((c) => selectedIds.value.includes(c.id))
  dragMoveInfo.value = {
    startX,
    startY,
    initialPositions: selectedComps.map((c) => ({
      id: c.id,
      top: c.top,
      left: c.left,
    })),
  }
  isMove.value = false
  document.addEventListener('mousemove', onCompMouseMove)
  document.addEventListener('mouseup', onCompMouseUp)
}

function onCompMouseMove(event) {
  if (!dragMoveInfo.value) return
  isMove.value = true
  const dx = event.clientX - dragMoveInfo.value.startX
  const dy = event.clientY - dragMoveInfo.value.startY
  dragMoveInfo.value.initialPositions.forEach((pos) => {
    const comp = components.value.find((c) => c.id === pos.id)
    if (comp) {
      comp.top = pos.top + dy
      comp.left = pos.left + dx
    }
  })
  // 拖动时计算辅助线
  calcGuides()
}

function onCompMouseUp() {
  dragMoveInfo.value = null
  guides.value = [] // 清空辅助线
  document.removeEventListener('mousemove', onCompMouseMove)
  document.removeEventListener('mouseup', onCompMouseUp)
  pushHistory() // 拖动结束记录历史
}

// ====== 辅助线计算 ======
function calcGuides() {
  if (selectedIds.value.length === 0) {
    guides.value = []
    return
  }
  const threshold = 3
  const newGuides = []

  selectedIds.value.forEach((movingId) => {
    const movingComp = components.value.find((c) => c.id === movingId)
    if (!movingComp) return

    const bounds = components.value.map((c) => {
      const width = getCompWidth(c)
      const height = getCompHeight(c)
      return {
        id: c.id,
        left: c.left,
        right: c.left + width,
        top: c.top,
        bottom: c.top + height,
      }
    })

    const movingWidth = getCompWidth(movingComp)
    const movingHeight = getCompHeight(movingComp)
    const movingBounds = {
      left: movingComp.left,
      right: movingComp.left + movingWidth,
      top: movingComp.top,
      bottom: movingComp.top + movingHeight,
    }

    bounds.forEach((b) => {
      if (b.id === movingId) return
      // 横向辅助线
      if (Math.abs(b.top - movingBounds.top) < threshold) {
        newGuides.push({ type: 'horizontal', position: b.top })
      }
      if (Math.abs(b.bottom - movingBounds.bottom) < threshold) {
        newGuides.push({ type: 'horizontal', position: b.bottom })
      }
      if (Math.abs(b.top - movingBounds.bottom) < threshold) {
        newGuides.push({ type: 'horizontal', position: b.top })
      }
      if (Math.abs(b.bottom - movingBounds.top) < threshold) {
        newGuides.push({ type: 'horizontal', position: b.bottom })
      }
      // 纵向辅助线
      if (Math.abs(b.left - movingBounds.left) < threshold) {
        newGuides.push({ type: 'vertical', position: b.left })
      }
      if (Math.abs(b.right - movingBounds.right) < threshold) {
        newGuides.push({ type: 'vertical', position: b.right })
      }
      if (Math.abs(b.left - movingBounds.right) < threshold) {
        newGuides.push({ type: 'vertical', position: b.left })
      }
      if (Math.abs(b.right - movingBounds.left) < threshold) {
        newGuides.push({ type: 'vertical', position: b.right })
      }
    })
  })

  // 去重
  guides.value = Array.from(new Set(newGuides.map((g) => g.type + '-' + g.position))).map((str) => {
    const [type, position] = str.split('-')
    return { type, position: Number(position) }
  })
}

// 获取组件宽高
function getCompWidth(comp) {
  const el = compRefs.value.find((e) => e?.getAttribute('data-id') == comp.id)
  if (el) return el.offsetWidth
  if (comp.style && comp.style.width) {
    return parseInt(comp.style.width)
  }
  return 120
}

function getCompHeight(comp) {
  const el = compRefs.value.find((e) => e?.getAttribute('data-id') == comp.id)
  if (el) return el.offsetHeight
  if (comp.style && comp.style.height) {
    return parseInt(comp.style.height)
  }
  return 40
}

// ====== 属性编辑相关 ======
// 当前选中的组件
const selectedComponent = computed(() => {
  if (selectedIds.value.length === 1) {
    const comp = components.value.find((c) => c.id === selectedIds.value[0])
    if (comp) {
      if (!comp.props) comp.props = {}
      if (!comp.style) comp.style = {}
      return comp
    }
  }
  return null
})

// 获取当前选中组件的属性配置
const componentProperties = computed(() => {
  if (!selectedComponent.value) return []
  return componentPropsConfig[selectedComponent.value.type] || []
})

// 属性变更处理
function onPropertyChange() {
  nextTick(() => {
    pushHistory() // 记录历史
  })
}

// 添加选项
function addOption(propName) {
  if (selectedComponent.value) {
    if (!Array.isArray(selectedComponent.value.props[propName])) {
      selectedComponent.value.props[propName] = []
    }
    selectedComponent.value.props[propName].push({ label: '', value: '' })
    onPropertyChange()
  }
}

// 删除选项
function removeOption(propName, idx) {
  if (selectedComponent.value && Array.isArray(selectedComponent.value.props[propName])) {
    selectedComponent.value.props[propName].splice(idx, 1)
    onPropertyChange()
  }
}

function onOptionChange() {
  onPropertyChange()
}

// ====== JSON导入导出相关 ======
const fileInput = ref(null)

// 处理导出
function handleExport() {
  exportComponentsToJson(components.value, {
    filename: 'lowcode-components',
    includeTimestamp: true,
    includeMetadata: true,
  })
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
      // 替换当前组件
      components.value = result.components
      selectedIds.value = []
      pushHistory()
    }
  } catch (error) {
    console.error('导入失败:', error)
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// ====== 一键布局相关 ======
// 处理布局命令
function handleLayoutCommand(command) {
  if (components.value.length === 0) {
    return
  }

  const margin = 20 // 组件间距
  const startX = 50 // 起始X坐标
  const startY = 50 // 起始Y坐标

  switch (command) {
    case 'grid':
      layoutGrid(margin, startX, startY)
      break
    case 'center':
      layoutCenter()
      break
    case 'distribute-h':
      distributeHorizontal()
      break
    case 'distribute-v':
      distributeVertical()
      break
    case 'align-left':
      alignLeft()
      break
    case 'align-right':
      alignRight()
      break
    case 'align-top':
      alignTop()
      break
    case 'align-bottom':
      alignBottom()
      break
  }

  pushHistory() // 记录历史
}


// 网格布局
function layoutGrid(margin, startX, startY) {
  const cols = Math.ceil(Math.sqrt(components.value.length)) // 计算列数
  let currentX = startX
  let currentY = startY
  let maxHeightInRow = 0

  components.value.forEach((comp, index) => {
    comp.left = currentX
    comp.top = currentY

    const width = getCompWidth(comp)
    const height = getCompHeight(comp)
    maxHeightInRow = Math.max(maxHeightInRow, height)

    if ((index + 1) % cols === 0) {
      // 换行
      currentX = startX
      currentY += maxHeightInRow + margin
      maxHeightInRow = 0
    } else {
      currentX += width + margin
    }
  })
}

// 居中对齐
function layoutCenter() {
  if (!mainRef.value) return

  const containerWidth = mainRef.value.offsetWidth

  components.value.forEach((comp) => {
    const width = getCompWidth(comp)
    comp.left = (containerWidth - width) / 2
  })
}

// 水平分布
function distributeHorizontal() {
  if (components.value.length < 2) return

  // 按左边界排序
  const sortedComps = [...components.value].sort((a, b) => a.left - b.left)
  const leftmost = sortedComps[0].left
  const rightmost = sortedComps[sortedComps.length - 1].left + getCompWidth(sortedComps[sortedComps.length - 1])
  const totalSpace = rightmost - leftmost
  const spacing = totalSpace / (components.value.length - 1)

  sortedComps.forEach((comp, index) => {
    comp.left = leftmost + index * spacing
  })
}

// 垂直分布
function distributeVertical() {
  const spacing = 20
  if (components.value.length < 2) return

  // 按顶部边界排序
  const sortedComps = [...components.value].sort((a, b) => a.top - b.top)

  sortedComps.forEach((comp, index) => {
    if (index === 0) return
    comp.top = sortedComps[index - 1].top + getCompHeight(sortedComps[index - 1]) + spacing
  })
}

// 左对齐
function alignLeft() {
  if (components.value.length === 0) return
  const leftmost = Math.min(...components.value.map(c => c.left))
  components.value.forEach(comp => {
    comp.left = leftmost
  })
}

// 右对齐
function alignRight() {
  if (components.value.length === 0) return
  const rightmost = Math.max(...components.value.map(c => c.left + getCompWidth(c)))
  components.value.forEach(comp => {
    comp.left = rightmost - getCompWidth(comp)
  })
}

// 顶对齐
function alignTop() {
  if (components.value.length === 0) return
  const topmost = Math.min(...components.value.map(c => c.top))
  components.value.forEach(comp => {
    comp.top = topmost
  })
}

// 底对齐
function alignBottom() {
  if (components.value.length === 0) return
  const bottommost = Math.max(...components.value.map(c => c.top + getCompHeight(c)))
  components.value.forEach(comp => {
    comp.top = bottommost - getCompHeight(comp)
  })
}
</script>

<style scoped src="@/assets/edit.scss"></style>
