<template>
    <div class="editor-layout">
        <div class="sidebar">
            <div draggable="true" class="component-item" v-for="(item, index) in registerConfig.componentList"
                :key="index" @dragstart="handleDragStart(item)">
                <div class="itemcontainer">
                    <span class="component-label">{{ item.label }}</span>
                    <component :is="item.type" v-bind="item.props"/>
                    <div class="item-mask"></div>
                </div>
            </div>
        </div>
        <div class="topbar">
            <el-button @click="undo" :disabled="!canUndo" type="primary" icon="ArrowLeft">后退</el-button>
            <el-button @click="redo" :disabled="!canRedo" type="primary" icon="ArrowRight">前进</el-button>
        </div>
        <div class="main" @dragover.prevent @drop="handleDrop" @click="clearSelection">
            <!-- 辅助线渲染 -->
            <div v-for="(guide, idx) in guides" :key="idx" :class="['guide-line', guide.type]" :style="guide.type === 'vertical'
                ? { left: guide.position + 'px' }
                : { top: guide.position + 'px' }"></div>
            <div class="comp" v-for="el in components" :key="el.id" :data-id="el.id" ref="compRefs"
                :class="{ selected: selectedIds.includes(el.id) }"
                :style="{ position: 'absolute', top: el.top + 'px', left: el.left + 'px', ...el.style ,width:'500px'}"
                @click.stop="selectComponent(el.id, $event)" @mousedown.stop="onCompMouseDown(el.id, $event)">
                <component :is="el.type" />
            </div>
        </div>
        <div class="rightbar"></div>
    </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import { registerConfig } from '@/ultils/register'

// ====== 历史记录相关 ======
const components = ref([
    { id: 1, type: 'ElButton', top: 40, left: 60 },
    { id: 2, type: 'ElInput', top: 120, left: 80 },
    { id: 3, type: 'ElCard', top: 200, left: 150 }
])
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
    components.value.push({
        id: newId,
        type: dragItem.value.type,
        top: mouseTop,
        left: mouseLeft,
        style: { ...dragItem.value.style }
    })

    dropInfo.value = { id: newId, mouseTop, mouseLeft }
    dragItem.value = null

    nextTick(() => {
        adjustComponentPosition()
        pushHistory() // 记录历史
    })
}

// 调整新组件位置，使其中心点在鼠标位置
function adjustComponentPosition() {
    const info = dropInfo.value
    if (!info.id) return
    const compEls = document.querySelectorAll('.main .comp')
    const lastCompEl = Array.from(compEls).find(el => el.getAttribute('data-id') == info.id)
    if (lastCompEl) {
        const rect = lastCompEl.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const newTop = info.mouseTop - height / 2
        const newLeft = info.mouseLeft - width / 2
        const comp = components.value.find(c => c.id === info.id)
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
            if (isMove.value) { isMove.value = false; return } // 拖动时不取消选中
            selectedIds.value = selectedIds.value.filter(i => i !== id)
        }
    } else {
        if (isMove.value) { isMove.value = false; return } // 拖动时不取消选中
        selectedIds.value = [id]
    }
}

// 点击 main 空白区域取消所有选中
function clearSelection(e) {
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
    const selectedComps = components.value.filter(c => selectedIds.value.includes(c.id))
    dragMoveInfo.value = {
        startX,
        startY,
        initialPositions: selectedComps.map(c => ({
            id: c.id,
            top: c.top,
            left: c.left
        }))
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
    dragMoveInfo.value.initialPositions.forEach(pos => {
        const comp = components.value.find(c => c.id === pos.id)
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
    guides.value = [] // 拖动结束清空辅助线
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

    selectedIds.value.forEach(movingId => {
        const movingComp = components.value.find(c => c.id === movingId)
        if (!movingComp) return

        const bounds = components.value.map(c => {
            const width = getCompWidth(c)
            const height = getCompHeight(c)
            return {
                id: c.id,
                left: c.left,
                right: c.left + width,
                top: c.top,
                bottom: c.top + height
            }
        })

        const movingWidth = getCompWidth(movingComp)
        const movingHeight = getCompHeight(movingComp)
        const movingBounds = {
            left: movingComp.left,
            right: movingComp.left + movingWidth,
            top: movingComp.top,
            bottom: movingComp.top + movingHeight
        }

        bounds.forEach(b => {
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
    guides.value = Array.from(new Set(newGuides.map(g => g.type + '-' + g.position)))
        .map(str => {
            const [type, position] = str.split('-')
            return { type, position: Number(position) }
        })
}

// 获取组件宽高（可根据实际情况调整）
function getCompWidth(comp) {
    const el = compRefs.value.find(e => e?.getAttribute('data-id') == comp.id)
    if (el) return el.offsetWidth
    if (comp.style && comp.style.width) {
        return parseInt(comp.style.width)
    }
    return 120
}

function getCompHeight(comp) {
    const el = compRefs.value.find(e => e?.getAttribute('data-id') == comp.id)
    if (el) return el.offsetHeight
    if (comp.style && comp.style.height) {
        return parseInt(comp.style.height)
    }
    return 40
}
</script>

<style scoped src="@/assets/edit.scss">

</style>
