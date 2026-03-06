<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :before-close="handleClose">
    <el-form :model="articleForm" :rules="rules" ref="articleFormRef" label-width="100px">
      <el-form-item label="文章标题" prop="title">
        <el-input
            v-model="articleForm.title"
            placeholder="请输入文章标题"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>

      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="articleForm.categoryId" placeholder="请选择分类" style="width: 100%">
          <el-option
              v-for="category in categoryOptions"
              :key="category.value"
              :label="category.label"
              :value="category.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="文章摘要" prop="summary">
        <el-input
            v-model="articleForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要（可选）"
            maxlength="1000"
            show-word-limit
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
            v-model="articleForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请输入或选择标签"
            style="width: 100%"
        >
          <el-option
              v-for="tag in tagOptions"
              :key="tag"
              :label="tag"
              :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="封面图片" prop="coverImage">
        <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
            :before-upload="beforeCoverUpload"
            accept=".jpg,.jpeg,.png"
        >
          <el-button type="primary" :loading="uploading">点击上传封面</el-button>
          <template #tip>
            <div class="el-upload__tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
          </template>
        </el-upload>
        <div v-if="articleForm.coverImage" class="cover-preview">
          <img :src="articleForm.coverImage" alt="封面预览"
               style="max-width: 200px; max-height: 120px; margin-top: 10px;"/>
          <div style="margin-top: 5px;">
            <el-button type="text" size="small" @click="removeCoverImage">移除</el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="文章内容" prop="content">
        <RichTextEditor
            v-model="articleForm.content"
            placeholder="请输入文章内容，支持富文本格式"
            :max-char-count="5000"
            :min-height="'400px'"
            :show-word-count="true"
            :toolbar-keys="[
            'bold', 'italic', 'underline', 'color', 'bgColor', '|',
            'fontSize', 'fontFamily', '|',
            'header1', 'header2', 'header3', '|',
            'bulletedList', 'numberedList', 'blockquote', '|',
            'insertLink', '|',
            'undo', 'redo'
          ]"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">{{ submitButtonText }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {ref, reactive, computed, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {fileUpload} from '@/api/knowledge.js'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 图片基础URL配置
const IMAGE_BASE_URL = 'http://159.75.169.224:1235'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add', // 'add' 或 'edit'
    validator: (value) => ['add', 'edit'].includes(value)
  },
  articleData: {
    type: Object,
    default: () => ({
      id: '',
      title: '',
      categoryId: '',
      summary: '',
      tags: [],
      coverImage: '',
      content: ''
    })
  },
  categoryOptions: {
    type: Array,
    default: () => []
  },
  tagOptions: {
    type: Array,
    default: () => [
      '情绪管理', '焦虑', '抑郁', '压力', '睡眠', '冥想', '正念', '放松', '心理健康', '自我成长', '人际关系', '工作压力', '学习方法', '生活技巧']
  }
})

const emit = defineEmits(['update:visible', 'submit', 'cancel'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const articleFormRef = ref()
const submitting = ref(false)
const uploading = ref(false)

const articleForm = reactive({
  id: '',
  title: '',
  categoryId: '',
  summary: '',
  tags: [],
  coverImage: '',
  content: ''
})

// 计算属性
const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增文章' : '编辑文章'
})

const submitButtonText = computed(() => {
  return props.mode === 'add' ? '确定' : '保存'
})

// 表单验证规则
const rules = {
  title: [
    {required: true, message: '请输入文章标题', trigger: 'blur'},
    {min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur'}
  ],
  categoryId: [
    {required: true, message: '请选择文章分类', trigger: 'change'}
  ],
  content: [
    {required: true, message: '请输入文章内容', trigger: 'blur'}
  ]
}

// 监听文章数据变化
watch(() => props.articleData, (newData) => {
  if (newData) {
    Object.assign(articleForm, {
      id: newData.id || '',
      title: newData.title || '',
      categoryId: newData.categoryId || '',
      summary: newData.summary || '',
      tags: Array.isArray(newData.tags) ? newData.tags : (newData.tags ? newData.tags.split(',') : []),
      coverImage: newData.coverImage || '',
      content: newData.content || ''
    })
  }
}, {immediate: true})

// 方法
const handleClose = (done) => {
  if (submitting.value) {
    return
  }
  dialogVisible.value = false
  done && done()
}

const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

const beforeCoverUpload = (file) => {
  const isJPGOrPNG = file.raw.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('封面图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleCoverChange = async (file) => {
  if (!beforeCoverUpload(file)) {
    return
  }

  uploading.value = true

  try {
    // 创建FormData对象
    const formData = new FormData()
    formData.append('file', file.raw)

    // 添加上传参数
    formData.append('businessType', 'ARTICLE')
    formData.append('businessField', 'cover')

    // 生成UUID作为businessId
    const uuid = crypto.randomUUID()
    formData.append('businessId', uuid)

    // 调用文件上传接口
    const result = await fileUpload(formData)
    console.log(result)
    articleForm.coverImage = IMAGE_BASE_URL + result.filePath

    ElMessage.success('封面图片上传成功')
  } catch (error) {
    console.error('封面图片上传失败:', error)
    ElMessage.error('封面图片上传失败')

    // 上传失败时显示本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      articleForm.coverImage = e.target.result
    }
    reader.readAsDataURL(file.raw)
  } finally {
    uploading.value = false
  }
}

const removeCoverImage = () => {
  articleForm.coverImage = ''
}

const handleSubmit = async () => {
  if (!articleFormRef.value) return

  try {
    const valid = await articleFormRef.value.validate()
    if (!valid) return

    submitting.value = true

    // 准备提交数据
    const submitData = {
      ...articleForm,
      tags: articleForm.tags.join(',')
    }

    emit('submit', submitData, props.mode)

  } catch (error) {
    console.error('表单提交失败:', error)
    ElMessage.error('表单提交失败')
  } finally {
    submitting.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  resetForm: () => {
    Object.assign(articleForm, {
      id: '',
      title: '',
      categoryId: '',
      summary: '',
      tags: [],
      coverImage: '',
      content: ''
    })
    if (articleFormRef.value) {
      articleFormRef.value.clearValidate()
    }
  }
})
</script>

<style scoped lang="scss">
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .editor-toolbar {
    padding: 8px;
    border-bottom: 1px solid #dcdfe6;
    background: #f5f7fa;
    display: flex;
    align-items: center;

    .el-button-group {
      margin-right: 10px;
    }

    .el-button--text {
      padding: 4px 8px;
      min-height: auto;
    }
  }

  :deep(.el-textarea) {
    border: none;

    .el-textarea__inner {
      border: none;
      border-radius: 0;
    }
  }
}

.upload-demo {
  .el-upload__tip {
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
  }
}

.cover-preview {
  margin-top: 10px;

  img {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
}
</style>