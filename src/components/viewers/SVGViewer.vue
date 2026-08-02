<template>
  <div style="width: 100%; height: 100%;">
    <el-menu
      class="el-menu-popper-demo"
      mode="horizontal"
      :popper-offset="8"
      :teleported="false"
      style="min-width:200px;"
    >
      <el-sub-menu index="1" :teleported="false">
        <template #title>
          <el-icon><ElIconFolderOpened /></el-icon>
          <span>File</span>
        </template>
        <el-menu-item
          index="default"
          @click="loadSVGTrigger()"
        >
          Load SVG
          <input
            ref="svgInput"
            id="load-svg"
            type="file"
            accept="image/svg+xml"
            @change="loadSVG()"
          />
        </el-menu-item>
        <el-menu-item
          @click="loadKnowledgeTrigger()"
          index="loadKnowdledge"
        >
          Load Knowledge
          <input
            ref="knowledgeInput"
            id="load-knowledge"
            type="file"
            accept="application/json"
            @change="loadKnowledge()"
            />
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
    <div
      ref="svgContainer"
      class="viewer-wrapper"
      v-html="svgContent"
      @click="handleClick"
    />
    <!--
    <SvgPanZoom
      style="width: 100%; height: 100%; border:1px solid black;"
      :zoomEnabled="true"
      :controlIconsEnabled="true"
      :fit="true"
      :center="true"
      :minZoom="0.1"
    >
     <div v-if="svgContent" v-html="svgContent" @click="handleClick" />
      <SampleSvg @click="handleClick"></SampleSvg>
    </SvgPanZoom>
  -->
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import svgPanZoom from "svg-pan-zoom";
import ContentMixin from "../../mixins/ContentMixin";
//import { getVariableName } from "../../services/knowledgeMapping";
import EventBus from "../EventBus";
import {
  ElMenu as Menu,
  ElSubMenu as SubMenu,
} from "element-plus";

import { markRaw } from 'vue';

const getVariableName = (knowledgeMap, name) => {
  if (Object.hasOwn(knowledgeMap.features, name)) {
    console.log("pass")
    const data = knowledgeMap.features[name];
    return data;
  }
};

export default {
  name: "SVGViewer",
  mixins: [ ContentMixin ],
  components: {
    Menu,
    SubMenu,
  },
  data: function() {
    return {
      knowledge: markRaw({}),
      svgContent: '',
      panZoomInstance: markRaw(null),
    }
  },

  methods: {
    handleClick: function(event) {
      const group = event.target.closest('g');
      if (!group) return;
      const titleEl = group.querySelector('title');
      if (titleEl) {
        const rawText = titleEl.textContent // ".id(q_Na_lumen)";
        const match = rawText.match(/\.id\(([^)]+)\)/);
        if (match) {
          const elementId = match[1]; // "q_Na_lumen"
          console.log('Clicked Element ID:', elementId);
          this.triggerSimulation(elementId);
        }
      }
    },
    loadKnowledgeTrigger: function() {
      const selectedFile = this.$refs["knowledgeInput"]?.click();
    },
    loadKnowledge: function() {
      const file = this.$refs['knowledgeInput'].files[0];
      if (!file || file.type !== 'application/json') return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.knowledge = markRaw(JSON.parse(e.target.result));
        console.log(this.knowledge)
      }
      reader.readAsText(file);
    },
    loadSVGTrigger: function() {
      const selectedFile = this.$refs['svgInput']?.click();
    },
    loadSVG: function() {
      const file = this.$refs['svgInput'].files[0];
      if (!file || file.type !== 'image/svg+xml') return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.panZoomInstance) {
          this.panZoomInstance.destroy();
          this.panZoomInstance = markRaw(null);
        }
        this.svgContent = e.target.result;
        this.$nextTick(() => {
          const svgEl = this.$refs['svgContainer'].querySelector('svg');
          if (svgEl) {
            // Initialize pan & zoom directly on the loaded SVG element
            this.panZoomInstance = markRaw(svgPanZoom(svgEl, {
              zoomEnabled: true,
              controlIconsEnabled: true,
              fit: true,
              center: true,
            }));
          }
        });
      }
      reader.readAsText(file);
    },
    triggerSimulation: function(elementId) {
      if (elementId) {
        const mapping = getVariableName(this.knowledge, elementId);
        const variable = mapping?.variable;
        console.log(variable)
        if (variable) {
          EventBus.emit(
            "opencor-set-axis",
            {
              label: "Y Axis",
              value: variable,
            }
          );
        }
      }
    },
  }
};
</script>


<style scoped>
/* Make groups display a pointer cursor */
:deep(g) {
  cursor: pointer;
}

:deep(.el-menu-popper-demo) {
  position:absolute;
  z-index:2;
  left:0px;
  position:absolute;
  background-color: rgba(255, 255, 255, 0.8);
  height:30px;
}

.viewer-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.viewer-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
}

.viewer-wrapper :deep(g) {
  cursor: pointer;
}

:deep(.el-menu), .el-sub-menu {
  border-bottom-right-radius: 8px;
  &:hover {
    border-bottom-right-radius: 8px;
  }
}

:deep(.el-menu), .el-sub-menu, .el-menu-item{
  color: #8300BF;
  --el-menu-active-color:#8300BF;
  --el-menu-hover-text-color:#8300BF;
  --el-menu-hover-bg-color:#F3E6F9;
  --el-menu-base-level-padding:10px;
  --el-menu-level-padding:10px;
  --el-font-family: "Asap", sans-serif;
  font-family: "Asap", sans-serif;

  .el-tooltip__trigger.el-tooltip__trigger {
    color: #8300BF;
    &:hover {
      background-color: #F3E6F9;
    }
  }

  input[type="file"] {
    display: none;
  }


  .el-sub-menu.is-active {
    .el-sub-menu__title {
      border-bottom: none;
    }
  }
}


</style>
