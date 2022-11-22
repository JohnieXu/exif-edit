<template>
  <div id="app">
    <ExifEdit @change="handleExifEditChange" />
  </div>
</template>

<script>
import download from 'downloadjs'
import ExifEdit from './components/ExifEdit.vue';

export default {
  name: 'App',
  components: {
    ExifEdit
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
}
body {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
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
</style>
