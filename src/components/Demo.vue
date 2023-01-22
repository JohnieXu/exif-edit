<template>
  <div class="demo">
    <div id="container" ref="container"></div>
  </div>
</template>

<script>
import Konva from "konva";
export default {
  name: "v-demo",
  data() {
    return {
      stage: null,
    };
  },
  mounted() {
    this.groupPosition();
  },
  methods: {
    groupPosition() {
      const stage = new Konva.Stage({
        container: this.$refs.container,
        width: 400,
        height: 300,
      });
      const layer = new Konva.Layer();
      var rect0 = new Konva.Rect({
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        stroke: "green",
        strokeWidth: 1,
      });
      var rect1 = new Konva.Rect({
        x: 20,
        y: 20,
        width: 100,
        height: 50,
        fill: "green",
        stroke: "black",
        strokeWidth: 1,
      });
      var group0 = new Konva.Group({
        x: 100,
        y: 0,
        width: 200,
        height: 200,
      });
      var rect2 = new Konva.Rect({
        x: 20,
        y: 20,
        width: 100,
        height: 50,
        fill: "blue",
        stroke: "black",
        strokeWidth: 1,
      });
      var rect3 = new Konva.Rect({
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        fill: "#ff000063",
      });
      var text0 = new Konva.Text({
        x: 0,
        y: 0,
        text: "Simple Text",
        fontSize: 30,
        fontFamily: "Calibri",
        fill: "yellow",
      });
      
      var text1 = new Konva.Text({
        x: 0,
        y: 50,
        text: "XIAOMI12SULTRA",
        fontSize: 26,
        fontFamily: "-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif",
        fontVariant: "bold",
        fill: "#000",
      })

      // 自定义字体
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      ctx.font = 'normal 20px relative-bold';
      var isFontLoaded = false;
      var TEXT_TEXT = 'Some test text;';
      var initialMeasure = ctx.measureText(TEXT_TEXT);
      var initialWidth = initialMeasure.width;

      // here is how the function works
      // different fontFamily may have different width of symbols
      // when font is not loaded a browser will use startard font as a fallback
      // probably Arial
      // when font is loaded measureText will return another width
      // eslint-disable-next-line
      function whenFontIsLoaded(callback, attemptCount) {
        if (attemptCount === undefined) {
          attemptCount = 0;
        }
        if (attemptCount >= 20) {
          callback();
          return;
        }
        if (isFontLoaded) {
          callback();
          return;
        }
        const metrics = ctx.measureText(TEXT_TEXT);
        const width = metrics.width;
        console.log(width, metrics.width);
        if (width !== initialWidth) {
          isFontLoaded = true;
          callback();
        } else {
          setTimeout(function () {
            console.log("whenFontIsLoaded attempt ", attemptCount)
            whenFontIsLoaded(callback, attemptCount + 1);
          }, 1000);
        }
      }
      
      // whenFontIsLoaded(() => {
      //   console.log('whenFontIsLoaded callback')
      //   // text1.fontFamily("Relative Bold");
      //   setTimeout(() => {
      //     text1.fontFamily("Relative Bold");
      //   }, 2);
      // })
      group0.add(rect2);
      group0.add(rect3);
      group0.add(text0);
      group0.add(text1);
      layer.add(rect0);
      layer.add(rect1);
      layer.add(group0);
      stage.add(layer);
      this.stage = stage;
    },
  },
};
</script>

<style scoped>
.demo {
}
#container {
  display: flex;
  justify-content: center;
}
</style>
