<!--
  使用：
  1. 有批量操作时，父组件必须传 updateSelect 方法
-->
<template>
  <!-- <div class="wrapper-pagination"> -->
    <Table :loading="loading" :columns='columns' :data='data' :height='height' :size='size' @on-selection-change="onSelectionChange"></Table>
  <!-- </div>   -->
</template>

<script>
export default {
  name: 'mainTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    height: [Number, String],
    size: String,
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onSelectionChange (selection) {
      this.$emit('updateSelect', selection)
    }
  }
}
</script>
