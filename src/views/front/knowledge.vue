<template>
  <div class="knowledge-container">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <el-icon size="32">
          <Notebook/>
        </el-icon>
        <h1>心理健康知识库</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 左侧推荐阅读 -->
      <div class="recommend-section">
        <div class="section-title">
          推荐阅读
        </div>
        <div class="recommend-list">
          <div class="recommend-item" v-for="item in recommendList" :key="item.id" @click="gotoArticle(item)">
            <div class="flex-box">
              <span>{{ item.title }}</span>
            </div>
            <div class="read-count">
              <el-icon>
                <View/>
              </el-icon>
              阅读量：{{ item.readCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧文章列表 -->
      <div class="article-list">
        <div class="article-item" v-for="article in articleList" :key="article.id" @click="gotoArticle(article)">
          <el-image
              :src="getCoverImage(article)"
              style="width: 120px; height: 80px; border-radius: 8px;"
              fit="cover"
          />
          <div class="info">
            <div class="title">
              <h3>{{ article.title }}</h3>
              <el-tag size="small" type="primary">{{ article.categoryName || '未分类' }}</el-tag>
            </div>
            <div class="meta">
              <span class="author"><el-icon><Avatar/></el-icon>{{ article.authorName || '系统管理员' }}</span>
              <span class="date"><el-icon><Calendar/></el-icon>{{
                  dayjs(article.updateAt).format('YYYY-MM-DD')
                }}</span>
              <span class="views"><el-icon><View/></el-icon>{{ article.readCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script setup>
import {ref, onMounted} from 'vue'
import {Notebook, View, Calendar, Avatar} from '@element-plus/icons-vue'
import {articlePage} from '@/api/knowledge.js'
import {dayjs} from "element-plus";
import router from "@/router/index.js";

// 图片基础URL配置
const IMAGE_BASE_URL = 'http://159.75.169.224:1235'

// 默认图片路径
const defaultImage = 'https://file.itndedu.com/psychology_ai.png'

// 推荐阅读列表数据
const recommendList = ref([])

// 文章列表数据
const articleList = ref([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(100)

const getCoverImage = (article) => {
  return article.coverImage ? IMAGE_BASE_URL + article.coverImage : defaultImage
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  // 这里可以调用接口获取数据
  loadArticles()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  // 调用接口获取数据
  loadArticles()
}

// 加载左侧推荐文章列表
const loadRecommendArticles = async () => {
  try {
    const params = {
      sortField: 'readCount', //推荐阅读
      sortDirection: 'desc', //倒序排列
      currentPage: currentPage.value,
      size: pageSize.value
    }

    const response = await articlePage(params)

    // 设置推荐阅读列表（取前5条作为推荐）
    recommendList.value = (response.records || []).slice(0, 5).map(item => ({
      id: item.id,
      title: item.title,
      readCount: item.views || 0
    }))
  } catch (error) {
    console.error('获取文章列表异常:', error)
  }
}


// 加载右侧侧文章列表
const loadArticles = async () => {
  try {
    const params = {
      sortField: 'publishedAt',
      sortDirection: 'desc', //倒序排列
      currentPage: currentPage.value,
      size: pageSize.value
    }

    const response = await articlePage(params)

    // 设置文章列表数据
    articleList.value = response.records || []

    // 设置总条数
    total.value = response.total || 0
  } catch (error) {
    console.error('获取文章列表异常:', error)
  }
}

//跳转文章详情
const gotoArticle = (article) => {
  router.push({name: 'article', params: {id: article.id}})
}

// 页面加载时初始化数据
onMounted(() => {
  loadRecommendArticles()
  loadArticles()
})
</script>
<style scoped lang="scss">
.knowledge-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
    }
  }

  .header-section {
    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    padding: 20px;

    .recommend-section {
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      height: 400px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .recommend-item {
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;

          .read-count {
            margin-top: 15px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }

    .article-list {
      flex: 1;

      .article-item {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;

        .info {
          margin-left: 20px;
          flex: 1;

          .title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;

            h3 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #374151;
            }
          }

          .meta {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #6b7280;

            span {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }
}
</style>