<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{title}}商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
          :title="title+'商品信息'"
          type="info"
          show-icon
          :closable="false" center>
      </el-alert>

      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性 3"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px"
               label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader style="width: 200px" clearable :options="cateList" :props="cascaderProps"
                           v-model="addForm.goods_cat" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headersObj"
                :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn_add" @click="add">{{title}}商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog
        title="图片预览"
        :visible.sync="previewDialogVisible"
        width="50%">
      <img :src="previewPath" class="previewImg"></img>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"

export default {
  name: "add",
  data() {
    return {
      activeIndex: 0,
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      cateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      addFormRules: {
        goods_name: [{required: true, message: "请输入商品名称", trigger: 'blur'}],
        goods_price: [{required: true, message: "请输入商品价格", trigger: 'blur'}],
        goods_weight: [{required: true, message: "请输入商品重量", trigger: 'blur'}],
        goods_number: [{required: true, message: "请输入商品数量", trigger: 'blur'}],
        goods_cat: [{required: true, message: "请选择商品分类", trigger: 'blur'}],
      },
      manyTabData: [],
      onlyTabData: [],
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      //请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      previewPath: '',
      previewDialogVisible: false,
    }
  },
  created() {
    this.type()
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
    title() {
      if (this.$route.params.type === "2"){
        return "修改"
      }else{
        return "添加"
      }
    }
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error("获取分类数据失败")
      }
      this.cateList = res.data
    },
    handleChange() {
      console.log(this.addForm.goods_cat)
      this.getCateList()
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.warning("请选择第三级分类")
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先商品分类！")
        return false
      }
    },
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    handleRemove(file) {
      const filePath = file.response.data.temp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    handleSuccess(response) {
      console.log(response)
      const picInfo = {pics: response.data.temp_path}
      this.addForm.pics.push(picInfo)
    },
    async tabClick() {
      if (this.activeIndex === "1") {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.manyTabData = res.data
      } else if (this.activeIndex === "2") {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.onlyTabData = res.data
      }
    },
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("请填写鼻翼要的表单项")
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.manyTabData.forEach(item => {
          const newInfo = [{attr_id: item.attr_id, attr_vals: item.attr_vals.join(' ')}]
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTabData.forEach(item => {
          const newInfo = [{attr_id: item.attr_id, attr_vals: item.attr_vals}]
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        if(this.$route.params.type === "1"){
          const {data: res} = await this.$http.post('goods', form)
          console.log(res)
          if (res.meta.status != 201) {
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        }
        if (this.$route.params.type === "2"){
          let id = this.$route.params.goods_id
          const {data: res} = await this.$http.post(`goods/${id}`, form)
          console.log(res)
          if (res.meta.status != 201) {
            return this.$message.error('修改商品信息失败')
          }
          this.$message.success('修改商品信息成功')
          this.$router.push('/goods')
        }

      })
    },
    async type() {
      if (this.$route.params.type === "2") {
        let id = this.$route.params.goods_id + 0
        const {data: res} = await this.$http.get(`goods/${id}`)
        if (res.meta.status !== 200) {
          this.$message.error("获取商品信息失败")
        }
        console.log(res.data)
        let good_cat = res.data.goods_cat.split(",")
        this.addForm.goods_name = res.data.goods_name
        this.addForm.goods_price = res.data.goods_price
        this.addForm.goods_weight = res.data.goods_weight
        this.addForm.goods_number = res.data.goods_number
        this.addForm.goods_cat = good_cat
        this.addForm.pics = res.data.pics
        this.addForm.goods_introduce = res.data.goods_introduce
        this.addForm.attrs = res.data.attrs
        console.log(this.addForm)
      }else{
        this.$refs.addFormRef.resetFields()
      }
    }
  }
}
</script>

<style scoped lang="less">
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btn_add {
  margin: 15px 0 0;
}
</style>