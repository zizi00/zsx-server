<template>
  <div class="home">
    欢迎页————展示主业务、按钮跳转
    <Button v-if="hasPerm('ad_index:dataGrid')" type="primary" @click="openPage('ad_index')">广告管理</Button>
    <Button v-if="hasPerm('softtext:dataGrid')" type="primary" @click="openPage('softtext')">软文管理</Button>
  </div>
</template>

<script>
import page from '@/mixins/page'
export default {
  name: "home",
  mixins: [page],
  methods: {
    paging(){

    },
    openPage(name){
      var vm = this
      vm.$store.dispatch('openNewPage',name)
      vm.$router.push({name: name})
    }
  }
};
</script>
