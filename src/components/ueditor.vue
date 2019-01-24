<template>
  <div>
    <div class="my-editor-wrapper">
      <script :id="id" type="text/plain">{{value}}</script>
    </div>
  </div>
</template>

<script>
export default {
  name: 'editor',
  props: {
    value: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: 'editor' + Math.random().toString().slice(-10)
    },
    config: {
      type: Object,
      default: function() {
        return {}
      }
    },
    height: {
      type: [Number, String],
      default: 400
    }
  },
  data(){
    return {
      editor: null,
      defaultConfig:{
        UEDITOR_HOME_URL: 'static/third-party/135/js',
        enableAutoSave: false
      },
    }
  },
  computed: {
    selfConfig: function (){
      return Object.assign({},this.defaultConfig,this.config)
    }
  },
  methods: {
    initEditor(value){
      var vm = this
      vm.$nextTick(function(){
        var current_editor =  UE.getEditor(vm.id,vm.selfConfig);
        current_editor.addListener('ready', () => {
          vm.$emit('ready', current_editor)
          vm.editor.setContent(value)
          vm.editor.addListener('contentChange', () => {
            vm.$emit('input', current_editor.getContent())
          })
        })
        window.current_editor = current_editor
        vm.editor = current_editor
      })
    },
    setContent(value){
      if (this.editor && this.editor.setContent) this.editor.setContent(value)
    }
  },
  watch: {
    value: {
      handler (value) {
        this.editor ? this.setContent(value) : this.initEditor(value)
      },
      immediate: true
    }
  },
  beforeDestroy () {
    if (this.editor && this.editor.destroy) this.editor.destroy()
  },
}
</script>
