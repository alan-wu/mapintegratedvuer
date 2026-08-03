<template>
  <div style="width: 100%; height: 100%;">
    <!-- URL Modal Dialog -->
    <el-dialog
      v-if="appendElement"
      v-model="dialogVisible"
      :title="dialogTitle"
      :before-close="dialogCancel"
      destroy-on-close
      :append-to="appendElement"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Target URL" prop="url">
          <el-input
            v-model="form.url"
            placeholder="https://example.com"
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogCancel">
            Cancel
          </el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit"> Load URL </el-button>
        </span>
      </template>
    </el-dialog>

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
          @click="triggerSVGLocal()"
        >
          Load SVG
          <input
            ref="svgInput"
            id="load-svg"
            type="file"
            accept="image/svg+xml"
            @change="loadSVGLocal()"
          />
        </el-menu-item>
        <el-menu-item
          index="default"
          @click="triggerSVGRemote()"
        >
          Load SVG (Remote)
        </el-menu-item>
        <el-menu-item
          @click="triggerKnowledgeLocal()"
          index="loadKnowdledge"
        >
          Load Knowledge
          <input
            ref="knowledgeInput"
            id="load-knowledge"
            type="file"
            accept="application/json"
            @change="loadKnowledgeLocal()"
            />
        </el-menu-item>
        <el-menu-item
          @click="triggerKnowledgeRemote()"
          index="loadKnowdledge"
        >
          Load Knowledge (Remote)
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
import { ElMessage } from 'element-plus';
import {
  ElDialog as Dialog,
  ElMenu as Menu,
  ElSubMenu as SubMenu,
} from "element-plus";
import 'element-plus/es/components/message/style/css';
import { markRaw } from 'vue';

const getVariableName = (knowledgeMap, name) => {
  console.log("getVariableName", knowledgeMap, name)
  if (Object.hasOwn(knowledgeMap.features, name)) {
    console.log("pass")
    const data = knowledgeMap.features[name];
    return data;
  }
};

const isURLValid = (string) => {
  try {
    const url = new URL(string);
    console.log(url)
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default {
  name: "SVGViewer",
  mixins: [ ContentMixin ],
  components: {
    Dialog,
    Menu,
    SubMenu,
  },
  data: function() {
    return {
      appendElement: undefined,
      dialogVisible: false,
      knowledge: markRaw(undefined),
      submitting: false,
      svgContent: '',
      panZoomInstance: markRaw(null),
      form: {
        url: '',
        type: 'SVG'
      },
      knowledgeURL: '',
      svgURL: '',
    }
  },
  computed: {
    dialogTitle: function () {
      return `Specify ${this.form.type} URL`;
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
    setKnowledgeContent: function(content) {
      this.knowledge = markRaw(content);
      ElMessage({
        message: 'Knowledge data loaded successfully',
        showClose: true,
        duration: 6000,
        type: "success",
        appendTo: this.appendElement,
      });
      this.dialogVisible = false;
    },
    loadKnowledgeLocal: function() {
      const file = this.$refs['knowledgeInput'].files[0];
      if (!file || file.type !== 'application/json') return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setKnowledgeContent(JSON.parse(e.target.result));
        console.log(this.knowledge)
      }
      reader.readAsText(file);
    },
    loadKnowledgeRemote: async function(url) {
      this.knowledgeURL = url;
      const response = await fetch(url);
      const knowledge = await response.json();
      this.setKnowledgeContent(knowledge);
    },
    triggerKnowledgeLocal: function() {
      this.$refs["knowledgeInput"]?.click();
    },
    triggerKnowledgeRemote: function () {
      this.form.type = "Knowledge";
      this.form.url = this.knowledgeURL;
      this.dialogVisible = true;
    },
    setSVGContent: function (content) {
      if (this.panZoomInstance) {
        this.panZoomInstance.destroy();
        this.panZoomInstance = markRaw(null);
      }
      this.svgContent = content;
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
          ElMessage({
            message: 'SVG data loaded successfully',
            showClose: true,
            duration: 6000,
            type: "success",
            appendTo: this.appendElement,
          });
          this.dialogVisible = false;
        }
      });
    },
    loadSVGLocal: function() {
      const file = this.$refs['svgInput'].files[0];
      if (!file || file.type !== 'image/svg+xml') return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setSVGContent(e.target.result);
      }
      reader.readAsText(file);

    },
    loadSVGRemote: async function(url) {
      this.svgURL = url;
      const response = await fetch(url);
      if (!response.ok) {
        ElMessage({
          message: 'There is an issue while loading the SVG data.',
          showClose: true,
          duration: 6000,
          type: "error",
          appendTo: this.appendElement,
        });
        return;
      }
      const svgText = await response.text();
      this.setSVGContent(svgText);
    },
    triggerSVGLocal: function() {
      this.$refs['svgInput']?.click();
    },
    triggerSVGRemote: function () {
      this.form.type = "SVG";
      this.form.url = this.svgURL;
      this.dialogVisible = true;
    },
    handleSubmit: function() {
      if (this.form.url) {
        if (isURLValid(this.form.url)) {
          if (this.form.type === "SVG") {
            this.loadSVGRemote(this.form.url);
          } else {
            this.loadKnowledgeRemote(this.form.url);
          }
        }
      }
    },
    dialogCancel: function () {
      this.form.url = '';
      this.dialogVisible = false;
    },
    triggerSimulation: function(elementId) {
      if (elementId) {
        let variable = elementId;
        if (this.knowledge) {
          const mapping = getVariableName(this.knowledge, elementId);
          variable = mapping?.variable;
        }
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
  },
  mounted: function() {
    this.appendElement = document.querySelector(".mapcontent");
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
