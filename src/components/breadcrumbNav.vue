<template>
  <el-breadcrumb>
    <template v-for="item in currentPath">
      <el-breadcrumb-item :to="{name: item.name}" :key="item.name">{{item.title}}</el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'breadcrumbNav',
  props: {
    currentPath: Array
  }
}
</script>

<style scoped>

</style>
