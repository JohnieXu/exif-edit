<template>
  <div id="app">
    <TypeSelect v-model="type"></TypeSelect>
    <ExifEdit v-show="type == 0" @change="handleExifEditChange" />
    <WatermarkEdit v-show="type == 1" />
    <VDemo v-show="type == 2"/>
    <EIconTest v-if="isEIconTestShow" />
  </div>
</template>

<script>
import download from 'downloadjs'
import ExifEdit from './components/ExifEdit.vue';
import EIconTest from './components/EIconTest.vue';
import TypeSelect from './components/TypeSelect.vue'
import WatermarkEdit from './components/WatermarkEdit.vue'
import VDemo from './components/Demo.vue'

export default {
  name: 'App',
  components: {
    ExifEdit,
    EIconTest,
    TypeSelect,
    WatermarkEdit,
    VDemo
  },
  data () {
    return {
      isEIconTestShow: false,
      type: "0"
    }
  },
  methods: {
    handleExifEditChange ({ b64: imgData, fileName }) {
      download(imgData, fileName, 'image/jpeg')
    }
  }
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif;
}
body {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  padding: 100px 22vw;
  /* max-width: 1200px; */
}
@media screen  and (max-width: 1600px){
  #app {
    padding: 100px 200px;
  }
}
@media screen  and (max-width: 1400px){
  #app {
    padding: 100px 140px;
  }
}
@media screen  and (max-width: 1000px){
  #app {
    padding: 100px 100px;
  }
}
@media screen and (max-width: 850px) {
  #app {
    padding: 40px;
  }
}
@media screen  and (max-width: 700px){
  #app {
    padding: 20px 20px;
  }
}
#app .pe_exif-edit {
  flex: 1;
}
#app .pe_wartermark_edit {
  flex: 1;
}
@media screen and (orientation: portrait) {
  #app .pe_exif-edit {
    flex-direction: column;
    padding-top: 30px;
    padding-bottom: 30px;
  }
  #app .pe_exif-edit__preview {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 0;
    padding-top: 0;
  }
  #app .pe_exif-edit__property {
    padding: 0;
  }
  #app .pe_exif-edit__actions {
    margin-top: 12px;
  }
  #app .pe_exif-edit__actions-button {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
