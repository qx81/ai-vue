<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </template>
    </PageHead>
     <TableSearch :formItems="formItems" @search="search"/>

    <!-- 文章列表表格 -->
    <el-card>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="title" label="标题" min-width="200"/>
        <el-table-column prop="categoryName" label="分类" width="120"/>
        <el-table-column prop="authorName" label="作者" width="100"/>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="180"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              link
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-else-if="row.status === 1"
              type="warning"
              link
              @click="handleOffline(row)"
            >
              下线
            </el-button>
            <el-button
              v-else-if="row.status === 2"
              type="success"
              link
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>

    </el-card>

    <!-- 文章弹窗组件 -->
    <ArticleDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :article-data="currentArticle"
      :category-options="categoryOptions"
      @submit="handleArticleSubmit"
      @cancel="handleDialogCancel"
    />
  </div>
</template>
<script setup>
import PageHead from "@/components/PageHead.vue";
import TableSearch from "@/components/TbaleSearch.vue";
import ArticleDialog from "@/components/ArticleDialog.vue";
import {onMounted, reactive, ref} from "vue";
import {getCategories, articlePage, articleAdd, articleUpdate, getArticleDetail, deleteArticle, updateArticleStatus} from "@/api/knowledge.js"
import { ElMessage, ElMessageBox } from 'element-plus'

const formItems = [
  {
    label: '标题',
    prop: 'title',
    type: 'input',
    placeholder: '请输入文章标题',
    col: 6
  }, {
    label: '分类',
    prop: 'categoryId',
    type: 'select',
    placeholder: '请选择文章分类',
    col: 6
  }, {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择文章状态',
    col: 6,
    options: [
      {
        label: '草稿',
        value: 0
      },
      {
        label: '已发布',
        value: 1
      },
      {
        label: '已下线',
        value: 2
      }
    ]
  }]

// 响应式数据
const tableData = ref([])
const loading = ref(false)
const categoryMap = reactive({})
const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})

// 弹窗相关数据
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'
const currentArticle = ref({})

// 分类选项
const categoryOptions = ref([])

// 当前查询条件
const currentSearchParams = ref({})

// 搜索函数
const search = async (formData) => {
  pagination.currentPage = 1
  // 保存当前查询条件
  currentSearchParams.value = { ...formData }
  await loadArticles(formData)
}

// 加载文章列表
const loadArticles = async (formData = null) => {
  loading.value = true
  try {
    // 如果没有传入formData，使用保存的查询条件
    const searchParams = formData !== null ? formData : currentSearchParams.value

    const params = {
      ...searchParams,
      currentPage: pagination.currentPage,
      size: pagination.size
    }
    const result = await articlePage(params)
    tableData.value = result.records || []
    pagination.total = result.total || 0

    // 处理分类名称映射
    tableData.value.forEach(item => {
      item.categoryName = categoryMap[item.categoryId] || '未知分类'
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  loadArticles()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadArticles()
}

// 状态显示处理
const getStatusText = (status) => {
  const statusMap = {
    0: '草稿',
    1: '已发布',
    2: '已下线'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return typeMap[status] || 'info'
}

// 弹窗相关方法
const handleAdd = () => {
  dialogMode.value = 'add'
  currentArticle.value = {}
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    dialogMode.value = 'edit'

    // 先显示弹窗，设置加载状态
    currentArticle.value = { id: row.id }
    dialogVisible.value = true

    // 获取文章详情
    const result = await getArticleDetail(row.id)

    // 更新当前文章数据
    currentArticle.value = {
      ...result,
      // 处理标签数据，如果后端返回的是字符串，转换为数组
      tags: typeof result.tags === 'string' ? result.tags.split(',').filter(tag => tag.trim()) : result.tags || []
    }

  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')

    // 如果获取详情失败，使用表格中的基础数据
    currentArticle.value = { ...row }
  }
}

const handleDelete = async (row) => {
  try {
    // 确认删除对话框
    await ElMessageBox.confirm(
      `确定要删除文章"${row.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用删除接口
    await deleteArticle(row.id)

    ElMessage.success('文章删除成功')

    // 刷新文章列表，使用保存的查询条件
    await loadArticles()

  } catch (error) {
    // 如果用户取消删除，不显示错误信息
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('删除文章失败:', error)
    ElMessage.error('删除文章失败')
  }
}

const handleArticleSubmit = async (submitData, mode) => {
  try {
    if (mode === 'add') {
      await articleAdd(submitData)
      ElMessage.success('文章新增成功')
    } else {
      await articleUpdate(submitData)
      ElMessage.success('文章更新成功')
    }

    dialogVisible.value = false

    // 刷新文章列表，使用保存的查询条件
    await loadArticles()

  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(mode === 'add' ? '新增文章失败' : '更新文章失败')
  }
}

const handleDialogCancel = () => {
  dialogVisible.value = false
}

// 发布文章
const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布文章"${row.title}"吗？`,
      '确认发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用状态更新接口，发布状态为1
    await updateArticleStatus(row.id, 1)

    ElMessage.success('文章发布成功')

    // 刷新文章列表，使用保存的查询条件
    await loadArticles()

  } catch (error) {
    // 如果用户取消操作，不显示错误信息
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('发布文章失败:', error)
    ElMessage.error('发布文章失败')
  }
}

// 下线文章
const handleOffline = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将文章"${row.title}"下线吗？`,
      '确认下线',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用状态更新接口，下线状态为2
    await updateArticleStatus(row.id, 2)

    ElMessage.success('文章下线成功')

    // 刷新文章列表，使用保存的查询条件
    await loadArticles()

  } catch (error) {
    // 如果用户取消操作，不显示错误信息
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('下线文章失败:', error)
    ElMessage.error('下线文章失败')
  }
}

onMounted(async () => {
  const result = await getCategories()

  // 初始化搜索表单的分类选项
  formItems[1].options = result.map(item => {
    categoryMap[item.id] = item.categoryName
    return {
      label: item.categoryName,
      value: item.id
    }
  })

  // 初始化新增表单的分类选项
  categoryOptions.value = result.map(item => ({
    label: item.categoryName,
    value: item.id
  }))

  //获取文章列表，使用空查询条件
  currentSearchParams.value = {}
  await loadArticles()
})

</script>
<style scoped lang="scss">
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

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