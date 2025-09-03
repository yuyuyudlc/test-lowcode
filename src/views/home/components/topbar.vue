<template>
  <transition name="slide-up">
    <div v-if="visible" class="dock-bar" ref="dockBar" @mouseenter="handleEnter" @mouseleave="handleLeave"
      @mousemove="handleDockMouseMove">
      <div class="menu">
        <template v-for="(item, idx) in items" :key="item.label">
          <div class="menu-item" :style="getItemStyle(idx)">
            <img :src="item.icon" alt="" />
          </div>
          <div v-if="idx < items.length - 1" class="gap"></div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const visible = ref(false)
let hideTimer = null

function showDock() {
  visible.value = true
  clearTimeout(hideTimer)
}

function hideSoon() {
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 500)
}

function handleEnter() {
  clearTimeout(hideTimer)
  setDockWidth(true)
}

function handleLeave() {
  hideSoon()
  resetCurve()
  setDockWidth(false)
}

function handleMouseMove(e) {
  const threshold = 10 // 距离底部10px以内
  if (window.innerHeight - e.clientY <= threshold) {
    showDock()
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  clearTimeout(hideTimer)
})

// dock 应用数据
const items = [
  { label: '题库', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/book.svg' },
  { label: '编辑', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/edit.svg' },
  { label: '预览', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/eye.svg' },
  { label: '设置', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/settings.svg' },
  { label: '导出', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/download.svg' },
  { label: '帮助', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/help-circle.svg' },
  { label: '用户', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/user.svg' },
  { label: '更多', icon: 'https://cdn.jsdelivr.net/gh/feathericons/feather/icons/more-horizontal.svg' },
]

const curveScales = ref(Array(items.length).fill(1))
const dockBar = ref(null)

function handleDockMouseMove(e) {
  nextTick(() => {
    const menu = dockBar.value.querySelector('.menu')
    const rect = menu.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const range = 300
    const maxScale = 1.8
    const minScale = 1

    // 计算每个图标中心点
    const iconWidth = 40
    const gapWidth = 15
    const centers = items.map((_, i) => i * (iconWidth + gapWidth) + iconWidth / 2 + i * gapWidth)
    curveScales.value = centers.map(center => {
      const beginX = mouseX - range / 2
      const endX = mouseX + range / 2
      if (center < beginX || center > endX) return minScale
      const x = (center - beginX) / range // 0~1
      return Math.sin(x * Math.PI) * (maxScale - minScale) + minScale
    })
  })
}

function resetCurve() {
  curveScales.value = curveScales.value.map(() => 1)
}

function getItemStyle(idx) {
  return {
    '--i': curveScales.value[idx],
    transition: 'width 0.18s, height 0.18s, margin-bottom 0.18s',
  }
}

// dock宽度自适应
function setDockWidth(expand) {
  nextTick(() => {
    const menu = dockBar.value?.querySelector('.menu')
    if (!menu) return
    if (expand) {
      const rect = menu.getBoundingClientRect()
      menu.style.width = rect.width + 80 + 'px'
    } else {
      menu.style.width = 'fit-content'
    }
  })
}
</script>

<style lang="scss" scoped>
.dock-bar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  z-index: 1000;

  .menu {
    margin-bottom: 20px;
    padding: 12px 15px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: end;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, .4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    width: fit-content;
    transition: width 0.2s;

    .menu-item {
      --i: 1;
      border-radius: 10px;
      width: calc(40px * var(--i));
      height: calc(40px * var(--i));
      margin-bottom: calc(var(--i) * 15px - 15px);
      background-color: rgb(34, 199, 158);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: width 0.18s, height 0.18s, margin-bottom 0.18s;

      img {
        width: 70%;
        height: 70%;
        object-fit: contain;
        filter: invert(1);
        pointer-events: none;
        user-select: none;
      }
    }

    .gap {
      --i: 1;
      width: calc(15px * var(--i));
      transition: width 0.18s;
    }
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
