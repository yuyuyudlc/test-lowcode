import { ElMessage } from 'element-plus'

/**
 * 导出组件数据为JSON文件
 * @param {Array} components - 组件数组
 * @param {Object} options - 导出选项
 */
export function exportComponentsToJson(components, options = {}) {
  try {
    const {
      filename = 'components',
      includeTimestamp = true,
      includeMetadata = true
    } = options

    // 构建导出数据
    const exportData = {
      ...(includeMetadata && {
        timestamp: new Date().toISOString(),
        componentCount: components.length,
        version: '1.0.0'
      }),
      components: components.map(comp => ({
        id: comp.id,
        type: comp.type,
        top: comp.top,
        left: comp.left,
        props: comp.props || {},
        style: comp.style || {}
      }))
    }

    // 转换为格式化的JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2)

    // 创建下载文件
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // 生成文件名
    const timestamp = includeTimestamp
      ? new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      : ''
    const finalFilename = `${filename}${timestamp ? '-' + timestamp : ''}.json`

    // 创建下载链接并触发下载
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = finalFilename
    downloadLink.style.display = 'none'

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // 清理URL对象
    URL.revokeObjectURL(url)

    ElMessage.success(`已导出 ${components.length} 个组件: ${finalFilename}`)

    return { success: true, filename: finalFilename, data: exportData }

  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败: ' + error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 从JSON文件读取组件数据
 * @param {File} file - 文件对象
 * @returns {Promise} - 返回Promise，resolve组件数组
 */
export function importComponentsFromJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('请选择文件'))
      return
    }

    // 检查文件类型
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('请选择JSON文件'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result)

        // 验证数据格式
        if (!jsonData.components || !Array.isArray(jsonData.components)) {
          throw new Error('JSON格式不正确：缺少components数组')
        }

        // 处理组件数据，重新生成ID避免冲突
        const importedComponents = jsonData.components.map(comp => ({
          id: Date.now() + Math.random(), // 重新生成ID
          type: comp.type || 'ElButton',
          top: comp.top || 0,
          left: comp.left || 0,
          props: comp.props || {},
          style: comp.style || {}
        }))

        ElMessage.success(`成功导入 ${importedComponents.length} 个组件`)
        resolve({
          success: true,
          components: importedComponents,
          metadata: {
            originalCount: jsonData.componentCount,
            timestamp: jsonData.timestamp,
            version: jsonData.version
          }
        })

      } catch (error) {
        console.error('解析JSON失败:', error)
        ElMessage.error('JSON格式错误: ' + error.message)
        reject({ success: false, error: error.message })
      }
    }

    reader.onerror = () => {
      const error = '文件读取失败'
      ElMessage.error(error)
      reject({ success: false, error })
    }

    reader.readAsText(file)
  })
}

/**
 * 从文本内容导入组件数据
 * @param {String} jsonText - JSON文本内容
 * @returns {Object} - 返回处理结果
 */
export function importComponentsFromText(jsonText) {
  try {
    if (!jsonText.trim()) {
      throw new Error('请输入JSON内容')
    }

    const jsonData = JSON.parse(jsonText)

    // 验证数据格式
    if (!jsonData.components || !Array.isArray(jsonData.components)) {
      throw new Error('JSON格式不正确：缺少components数组')
    }

    // 处理组件数据
    const importedComponents = jsonData.components.map(comp => ({
      id: Date.now() + Math.random(),
      type: comp.type || 'ElButton',
      top: comp.top || 0,
      left: comp.left || 0,
      props: comp.props || {},
      style: comp.style || {}
    }))

    ElMessage.success(`成功导入 ${importedComponents.length} 个组件`)

    return {
      success: true,
      components: importedComponents,
      metadata: {
        originalCount: jsonData.componentCount,
        timestamp: jsonData.timestamp,
        version: jsonData.version
      }
    }

  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败: ' + error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 验证组件数据格式
 * @param {Array} components - 组件数组
 * @returns {Boolean} - 是否有效
 */
export function validateComponentsData(components) {
  if (!Array.isArray(components)) {
    return false
  }

  return components.every(comp => {
    return comp.hasOwnProperty('id') &&
      comp.hasOwnProperty('type') &&
      comp.hasOwnProperty('top') &&
      comp.hasOwnProperty('left')
  })
}
