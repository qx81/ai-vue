<template>
  <el-form :inline="true" class="search-form">
    <el-row :gutter="24">
      <template v-for="item in props.formItems" :key="item.prop">
        <el-col :span="item.col || 6">
          <el-form-item :label="item.label" :prop="item.prop">
            <component :is="convertItemType(item.type)" v-model="formData[item.prop]" :placeholder="item.placeholder">
              <template v-if="item.type === 'select'">
                <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                           :value="option.value"></el-option>
              </template>
            </component>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-row :gutter="24">
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="primary" @click="handleReset">重置</el-button>
    </el-row>
  </el-form>
</template>
<script setup>
import {ref, watch} from "vue";

const props = defineProps({
  formItems: {
    type: Array,
    default: () => []
  }
})

const formData = ref({})

// 初始化表单数据
watch(() => props.formItems, (newItems) => {
  if (newItems && newItems.length > 0) {
    newItems.forEach(item => {
      if (!(item.prop in formData.value)) {
        formData.value[item.prop] = item.value || ''
      }
    })
  }
}, {immediate: true})

const convertItemType = (type) => {
  return {
    'input': 'el-input',
    'select': 'el-select',
    'date': 'el-date-picker',
    'time': 'el-time-picker'
  }[type]
}
const emit = defineEmits(['search'])
const handleSearch = () => {
  emit('search', formData.value)
}

const handleReset = () => {
  // 重置 formData 对象
  Object.keys(formData.value).forEach(key => {
    formData.value[key] = '';
  });

  handleSearch();
}
</script>

<style scoped>
.search-form {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.el-select) {
  width: 200px;
}

:deep(.el-input) {
  width: 200px;
}

:deep(.el-date-editor) {
  width: 200px;
}
</style>
<style scoped lang="scss">
</style>