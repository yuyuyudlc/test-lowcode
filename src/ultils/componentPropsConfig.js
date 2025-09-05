const componentPropsConfig = {
  ElButton: [
    { name: 'text', label: '按钮文本', type: 'string', placeholder: '请输入按钮文本' },
    {
      name: 'type', label: '按钮类型', type: 'select', options: [
        { label: '默认', value: '' },
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' }
      ]
    },
    {
      name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '默认', value: '' },
        { label: '小', value: 'small' }
      ]
    },
    { name: 'disabled', label: '禁用', type: 'boolean' }
  ],
  ElInput: [
    { name: 'placeholder', label: '占位符', type: 'string', placeholder: '请输入占位符文本' },
    { name: 'disabled', label: '禁用', type: 'boolean' },
    { name: 'clearable', label: '可清空', type: 'boolean' },
    { name: 'maxlength', label: '最大长度', type: 'number', min: 0 }
  ],
  ElCard: [
    { name: 'header', label: '卡片标题', type: 'string', placeholder: '请输入标题' },
    {
      name: 'shadow', label: '阴影', type: 'select', options: [
        { label: '总是', value: 'always' },
        { label: '悬停', value: 'hover' },
        { label: '从不', value: 'never' }
      ]
    }
  ],
  // 题目类组件
  RadioQuestion: [
    { name: 'title', label: '题面', type: 'string', placeholder: '请输入题目内容' },
    { name: 'description', label: '描述', type: 'string', placeholder: '请输入描述' },
    {
      name: 'options',
      label: '选项',
      type: 'optionArray', // 自定义类型
      itemFields: [
        { name: 'label', label: '选项文本', type: 'string' },
        { name: 'value', label: '选项值', type: 'string' }
      ]
    },
    { name: 'required', label: '必填', type: 'boolean' },
    { name: 'disabled', label: '禁用', type: 'boolean' }
  ],
  CheckboxQuestion: [
    { name: 'title', label: '题面', type: 'string', placeholder: '请输入题目内容' },
    { name: 'description', label: '描述', type: 'string', placeholder: '请输入描述' },
    {
      name: 'options',
      label: '选项',
      type: 'optionArray',
      itemFields: [
        { name: 'label', label: '选项文本', type: 'string' },
        { name: 'value', label: '选项值', type: 'string' }
      ]
    },
    { name: 'required', label: '必填', type: 'boolean' },
    { name: 'disabled', label: '禁用', type: 'boolean' },
    { name: 'max', label: '最多可选', type: 'number', min: 1 }
  ],
  FillQuestion: [
    { name: 'title', label: '题面', type: 'string', placeholder: '请输入题目内容' }
  ],
  EssayQuestion: [
    { name: 'title', label: '题面', type: 'string', placeholder: '请输入题目内容' }
  ]
}

export default componentPropsConfig
