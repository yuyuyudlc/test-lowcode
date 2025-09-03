function createEditorConfig() {
  const componentList = [];

  return {
    componentList,
    register: (el) => {
      componentList.push(el);
    }
  };
}

export let registerConfig = createEditorConfig();

// 注册基础组件
registerConfig.register({
  id: 'input_' + Date.now(),
  label: '输入框',
  type: 'ElInput',
  style: {
    width: '200px',
    height: '32px'
  },
  props: {
    placeholder: '请输入内容',
    disabled: false,
    clearable: true
  },
  events: {},
  category: 'form'
});

registerConfig.register({
  id: 'button_' + Date.now(),
  label: '按钮',
  type: 'ElButton',
  style: {
    width: 'auto',
    height: '32px',
  },
  props: {
    text: '按钮',
    type: 'primary',
    disabled: false
  },
  events: {},
  category: 'form'
});

// 注册题目组件
registerConfig.register({
  id: 'radio_question_' + Date.now(),
  label: '单选题',
  type: 'RadioQuestion',
  style: {
    width: '100%',
    minHeight: '120px'
  },
  props: {
    title: '这是一道单选题',
    description: '请选择正确答案',
    options: [
      { label: '选项A', value: 'A' },
      { label: '选项B', value: 'B' },
      { label: '选项C', value: 'C' },
      { label: '选项D', value: 'D' }
    ],
    required: true,
    disabled: false
  },
  events: {
    change: 'onRadioChange'
  },
  category: 'question'
});

registerConfig.register({
  id: 'checkbox_question_' + Date.now(),
  label: '多选题',
  type: 'CheckboxQuestion',
  style: {
    width: '100%',
    minHeight: '120px'
  },
  props: {
    title: '这是一道多选题',
    description: '可选择多个答案',
    options: [
      { label: '选项A', value: 'A' },
      { label: '选项B', value: 'B' },
      { label: '选项C', value: 'C' },
      { label: '选项D', value: 'D' }
    ],
    required: true,
    disabled: false,
    max: 3
  },
  events: {
    change: 'onCheckboxChange'
  },
  category: 'question'
});

registerConfig.register({
  id: 'fill_question_' + Date.now(),
  label: '填空题',
  type: 'FillQuestion',
  style: {
    width: '100%',
    minHeight: '80px'
  },
  props: {
    title: '这是一道道道道道填空题',
    description: '请填写正确答案',
    placeholder: '请输入答案',
    required: true,
    disabled: false,
    maxlength: 100,
    showWordLimit: true,
    clearable: true
  },
  events: {
    change: 'onFillChange',
    input: 'onFillInput'
  },
  category: 'question'
});

registerConfig.register({
  id: 'essay_question_' + Date.now(),
  label: '问答题',
  type: 'EssayQuestion',
  style: {
    width: '100%',
    minHeight: '150px'
  },
  props: {
    title: '这是一道问答题',
    description: '请详细阐述您的观点',
    placeholder: '请详细回答问题...',
    required: true,
    disabled: false,
    rows: 4,
    maxlength: 1000,
    showWordLimit: true,
    resize: 'vertical'
  },
  events: {
    change: 'onEssayChange',
    input: 'onEssayInput'
  },
  category: 'question'
});
