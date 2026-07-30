<template>
  <SvgPanZoom
    style="width: 100%; height: 100%; border:1px solid black;"
    :zoomEnabled="true"
    :controlIconsEnabled="true"
    :fit="true"
    :center="true"
    :minZoom="0.1"
  >
    <SampleSvg @click="handleClick"></SampleSvg>
  </SvgPanZoom>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { SvgPanZoom } from "vue-svg-pan-zoom";
import ContentMixin from "../../mixins/ContentMixin";
import SampleSvg from "../../assets/epithelial-map.svg?component";


export default {
  name: "SVGViewer",
  mixins: [ ContentMixin ],
  components: {
    SampleSvg,
    SvgPanZoom,
  },
  data: function() {
    return {
      svgContent: '',
    }
  },
  created: function() {
    this.svgContent = SampleSvg;
  },
  methods: {
    handleClick: function() {
      const target = event.target
      const elementId = target.id || target.getAttribute('data-name')

      if (elementId) {
        console.log('Clicked element inside local SVG:', elementId)
      }

    }
  }
};
</script>
