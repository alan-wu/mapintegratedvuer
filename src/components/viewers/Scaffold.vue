<template>
  <div class="viewer-container">
    <ScaffoldVuer
      v-if="activated"
      :state="entry.state"
      :url="entry.resource"
      :region="entry.region"
      @scaffold-selected="scaffoldResourceSelected(entry.type, $event)"
      @scaffold-highlighted="scaffoldHighlighted(entry.type, $event)"
      @scaffold-navigated="scaffoldNavigated(entry.type, $event)"
      @on-ready="scaffoldIsReady"
      @open-map="openMap"
      ref="scaffold"
      :background-toggle="true"
      :traditional="true"
      :helpMode="helpMode"
      :helpModeActiveItem="helpModeActiveItem"
      :helpModeDialog="useHelpModeDialog"
      @annotation-open="onAnnotationOpen"
      @annotation-close="onAnnotationClose"
      @update-offline-annotation-enabled="updateOfflineAnnotationEnabled"
      :annotationSidebar="annotationSidebar"
      @help-mode-last-item="onHelpModeLastItem"
      @shown-tooltip="onTooltipShown"
      @shown-map-tooltip="onMapTooltipShown"
      :render="visible"
      :display-latest-message="true"
      :warning-message="warningMessage"
      :display-minimap="false"
      :display-markers="false"
      :display-warning="false"
      :enableOpenMapUI="true"
      :view-u-r-l="entry.viewUrl"
      :markerCluster="true"
      :markerLabels="markerLabels"
      :flatmapAPI="flatmapAPI"
      :showLocalSettings="showLocalSettings"
      :showOpenMapButton="showOpenMapButton"
      :usageConfig="{
        showTubeLinesControls: false,
        tubeLines: (entry.discoverId === '307' || entry.discoverId === 307)
      }"
      @zinc-object-added="zincObjectAdded"
    />

    <HelpModeDialog
      v-if="helpMode && useHelpModeDialog"
      ref="scaffoldHelp"
      :scaffoldRef="scaffoldRef"
      :lastItem="helpModeLastItem"
      @show-next="onHelpModeShowNext"
      @finish-help-mode="onFinishHelpMode"
    />
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { markRaw } from "vue";
import EventBus from "../EventBus";
import { ElMessage } from 'element-plus';
import ContentMixin from "../../mixins/ContentMixin";
import { ScaffoldVuer } from "@abi-software/scaffoldvuer";
import "@abi-software/scaffoldvuer/dist/style.css";
import { HelpModeDialog } from '@abi-software/map-utilities'
import '@abi-software/map-utilities/dist/style.css'
import { getReferenceConnectivitiesFromStorage, getReferenceConnectivitiesByAPI } from "@abi-software/flatmapvuer/src/services/flatmapKnowledge.js";
import 'element-plus/es/components/message/style/css';

export default {
  name: "Scaffold",
  mixins: [ ContentMixin ],
  components: {
    ScaffoldVuer,
    HelpModeDialog,
  },
  methods: {
    showConnectivitiesByReference: async function (resource) {
      if (this.$refs.scaffold) {
        const flatmapKnowledge = sessionStorage.getItem('flatmap-knowledge');
        let featureIds = [];
        if (flatmapKnowledge) {
          featureIds = await getReferenceConnectivitiesFromStorage(resource);
        } else {
          featureIds = await getReferenceConnectivitiesByAPI(this.flatmapService.mapImp, resource, this.flatmapService.flatmapQueries);
        }
        const nerveLabels = [];
        for (const id of featureIds) {
          const knowledge = this.nervesKnowledge.find(k => k.id === id);
          if (!knowledge) continue;

          const nerves = knowledge['nerve-label'];
          if (nerves) {
            const subNerves = nerves.flatMap(n => n.subNerves);
            nerveLabels.push(...subNerves);
          }
        }
        this.$refs.scaffold.changeHighlightedByName(nerveLabels, "", false);
      }
    },
    setNerveGreyScale: function () {
      if (this.$refs.scaffold) {
        if (this.nervesKnowledge.length) {
          const nerves = this.nervesKnowledge.reduce((acc, val) => {
            return acc.concat(val['nerve-label'] || []);
          }, []);
          const excludedLabels = nerves.reduce((acc, nerve) => {
            return acc.concat(nerve.subNerves || []);
          }, []);
          this.$refs.scaffold.setGreyScale(true, excludedLabels);
        }
      }
    },
    setVisibilityFilter: function (payload) {
      if (this.$refs.scaffold) {
        let names = [];
        const processed = payload ? true : false;
        if (payload) {
          const ids = [];
          payload['OR'].forEach(orData => {
            if ('AND' in orData) {
              if (orData['AND'].length >= 2 && 'models' in orData['AND'][1]) {
                ids.push(...orData['AND'][1]['models']);
              }
            }
          });
          for (const id of ids) {
            const nerveKnowledge = this.nervesKnowledge.find((knowledge) => knowledge.id === id);
            if (nerveKnowledge) {
              const nerves = nerveKnowledge['nerve-label'].map(n => n.subNerves).flat(Infinity);
              names.push(...nerves);
            }
          }
        }
        this.$refs.scaffold.zoomToNerves(names, processed);
      }
    },
    syncFilter: function (data) {
      if (this.$refs.scaffold?.viewingMode === "Neuron Connection") {
        this.filter = data.filter(f => f.facet?.toLowerCase() !== 'show all');
      }
    },
    scaffoldResourceSelected: async function (type, resource) {

      this.resourceSelected(type, resource, true)







      // When we directly click on a nerve, there will only be only one resource selected.
      // Both EventBus.emit and getKnowledgeTooltip will trigger sidebar content update
      // Then setVisibilityFilter will be called to zoom to the clicked nerve.

      /*
      if (resource.length === 1) {
        this.clickedObject = resource[0].data;
        if (this.clickedObject.isNerves || this.clickedObject.anatomicalId) {
          const label = this.clickedObject.id.toLowerCase();
          if (this.$refs.scaffold.viewingMode === "Neuron Connection") {
            const connectionType = this.settingsStore.globalSettings.connectionType;

            // nerve click
            if (this.clickedObject.isNerves) {
              this.filter.push({
                facet: label,
                term: 'Nerves',
                facetPropPath: 'scaffold.connectivity.nerve',
              });
            } else {
              // get neuron connection mode
              const connectionTypeKey = connectionType.toLowerCase();
              let uberonTerm = this.clickedObject.anatomicalId || '';

              if (uberonTerm) {
                this.filter.push({
                  facet: `["${uberonTerm}",[]]`,
                  facetPropPath: `flatmap.connectivity.source.${connectionTypeKey}`,
                  tagLabel: label.charAt(0).toUpperCase() + label.slice(1),
                  term: connectionType,
                });
              } else {
                // get filterOptions from store
                const filterOptions = this.connectivitiesStore.filterOptions[this.entry.resource];
                const filterOption = filterOptions.find((option) => option.key === `flatmap.connectivity.source.${connectionTypeKey}`);
                let neuronFilter;

                filterOption?.children.forEach((child) => {
                  if (child.label.toLowerCase() === label) {
                    neuronFilter = child;
                  }
                  child.children?.forEach((grandChild) => {
                    if (grandChild.label.toLowerCase() === label) {
                      neuronFilter = grandChild;
                    }
                  });
                });

                if (neuronFilter) {
                  uberonTerm = neuronFilter.key.replace(`flatmap.connectivity.source.${connectionTypeKey}.`, '');
                  this.filter.push({
                    facet: uberonTerm,
                    facetPropPath: `flatmap.connectivity.source.${connectionTypeKey}`,
                    tagLabel: neuronFilter.tagLabel,
                    term: connectionType,
                  });
                }
              }
            }

            EventBus.emit("neuron-connection-feature-click", {
              filters: this.filter,
              search: this.filter.length ? '' : label
            })
          } else if (this.$refs.scaffold.viewingMode === "Exploration") {
            const nerveKnowledge = this.nervesKnowledge
              .filter(knowledge => JSON.stringify(knowledge['nerve-label']).includes(label));
            if (nerveKnowledge.length) {
              this.getKnowledgeTooltip({ data: nerveKnowledge, type: this.entry });
            }
          }
        }
      } else if (resource.length > 1) {
        // zoomToNerves will cause multiple resources selected
        // if multiple resources selected is because of directly clicking on a nerve
        // enable picking again
        // otherwise, it is related to the explorer search
        if (this.$refs.scaffold.viewingMode === "Exploration") {
          if (this.clickedObject) {
            this.$refs.scaffold.$module.setIgnorePicking(false);
          }
        }
      } else {
        this.clickedObject = undefined;
        EventBus.emit("connectivity-info-close");
      }
      */
    },
    onResize: function () {
      if (!this.scaffoldCamera) {
        this.scaffoldCamera = markRaw(this.$refs.scaffold?.$module?.scene?.getZincCameraControls());
      }
      if (this.scaffoldCamera) {
        this.scaffoldCamera.onResize();
      }
    },
    getState: function () {
      if (this.$refs.scaffold) {
        return this.$refs.scaffold.getState();
      } else {
        return this.entry.state;
      }
    },
    /**
     * Perform a local search on this contentvuer
     */
    search: function (term) {
      if (this.$refs.scaffold) {
        return this.$refs.scaffold.search(term, true);
      }
    },
    searchSuggestions: function(term, suggestions){
      if (term === "" || !this.$refs.scaffold) {
        return suggestions;
      }
      const items = this.$refs.scaffold.fetchSuggestions(term);
      items.forEach(item => {
        if (item.suggestion) suggestions.push(item.suggestion);
      });
    },
    showConnectivityTooltips: function (payload) {
      if (this.$refs.scaffold) {
        if (payload.label) {
          this.$refs.scaffold.changeHighlightedByName([payload.label], "", false);
          this.$refs.scaffold.showRegionTooltip(payload.label, false, false);
        } else {
          const nerves = payload.connectivityInfo['nerve-label'];
          if (nerves) {
            const nerveLabels = nerves.flatMap(n => n.subNerves);
            this.$refs.scaffold.changeHighlightedByName(nerveLabels, "", false);
          }
          this.$refs.scaffold.hideRegionTooltip();
        }
      }
    },
    zoomToFeatures: function(info, forceSelect) {
      if (this.$refs.scaffold) {
        let names = undefined;
        if (Array.isArray(info)) names = info;
        else names = [ info.name ];
        if (forceSelect) {
          this.$refs.scaffold.changeActiveByName(names, "", false);
        }
        this.$refs.scaffold.viewRegion(names);
      }
    },
    readNIFTI: async function () {
      const ele = this.$refs.scaffoldContainer;
      const original = ElMessage({
        message: 'Downloading texture',
        showClose: true,
        duration: 0,
      });

      const v1 = {
        "id": "mesh-location-orientation",
        "locations": [
          {
            "identifier": 1,
            "label": "original",
            "orientation": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
            "position": [-283, -363, 1090],
            "scale": [540, 540, 276],
            "flipY": false,
            "flipZ": true,
            "reference_point": "corner"
          }
        ],
        "settings": {
          "slides": [
            {
              "direction": "x",
              "value": 0.5
            },
            {
              "direction": "y",
              "value": 0.5
            },
            {
              "direction": "z",
              "value": 0.45
            }
          ]
        },
        "type": "slides"
      }

      const options = {
        hideWhitePixel: false,
        hideBlackPixel: false,
        keepScalePosition: true,
        filterByValue: true,
        timeEnabled: true,
      }
      const urls = [
        "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/Exam5332_phase_1.nii.gz",
        "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/Exam5332_phase_3.nii.gz",
        "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/Exam5332_phase_5.nii.gz",
      ]

     /*
      const urls = [
        "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/downsample_phase_1.nii.gz",
        "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/downsample_phase_3.nii.gz",
        "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/downsample_phase_5.nii.gz",
      ]
      */



      const newTexture = await this.$refs.scaffold.readNIFTIFromSource(urls, true, this.maskUrl, v1, options);
      original.close();
      if (newTexture) {
        ElMessage({
          message: 'Texture loaded Successfully',
          showClose: true,
          duration: 6000,
          type: "success",

        });
        newTexture.timeEnabled = true;
        newTexture.setIsPickable(false);
        const scene = this.$refs.scaffold.$module.scene;
        newTexture.setBrightness(0.38);
        newTexture.setContrast(3.5);
        newTexture.setPosition(-158.73, -150.51, -198.50);
        scene.addZincObject(newTexture);
      } else {
        ElMessage({
          message: 'Texture loaded Successfully',
          showClose: true,
          duration: 6000,
          type: "success",
        });
      }
    },
    zincObjectAdded: function(zincObject) {
      const regionName = zincObject.region?.getName()
      if (!(regionName && regionName === "airways")) {
        zincObject.setIsPickable(false);
      }

    },
    scaffoldIsReady: function () {
      this.scaffoldLoaded = true;
      this.$refs.scaffold.$module.graphicsHighlight.highlightColour = [1, 0, 1];
      if (this.entry.resource === "https://mapcore-bucket1.s3.us-west-2.amazonaws.com/digital_twins/080626-demo/scaffold-1/_metadata.json") {
        this.readNIFTI();
      }
      this.settingsStore.userData.scaffoldRef = this.$refs.scaffold;
      /*
      if (!this.scaffoldRef) {
        this.scaffoldRef = markRaw(this.$refs.scaffold);
        if (this.scaffoldRef) {
          this.loadExplorerConfig();
          this.connectivityKnowledge = this.connectivitiesStore.globalConnectivities;
          this.connectivityFilterOptions = this.connectivitiesStore.filterOptions;
          this.connectivityFilterSources = this.connectivitiesStore.filterSources;
        }
      }
      this.updateViewerSettings();
      EventBus.emit("mapLoaded", this.$refs.scaffold);
      setTimeout(() => {
        this.setNerveGreyScale();
      }, 500);
      */
    },
    /**
     * Callback when the vuers emit a selected event.
     */
    scaffoldHighlighted: function (type, resource) {
      const result = {
        paneIndex: this.entry.id,
        type: type,
        resource: resource,
        internalName: undefined,
      };
      if (resource && resource[0]) {
        if (resource[0].data?.id === undefined || resource[0].data?.id === "") {
          resource[0].data.id = resource[0].data?.group;
        }
        result.internalName = resource[0].data.id;
        result.eventType = "highlighted";
      }
      this.$emit("resource-selected", result);
    },
    /**
     * Callback when the vuers emit a selected event.
     */
    scaffoldNavigated: function (type, resource) {
      if (this.mouseHovered) {
        const result = {
          paneIndex: this.entry.id,
          eventType: "panZoom",
          payload: resource,
          type: type,
        };
        this.$emit("resource-selected", result);
      }
    },
    updateWithViewUrl: function(viewUrl) {
      if (this.$refs.scaffold) {
        this.$refs.scaffold.updateViewURL(viewUrl);
      }
    },
    /**
     * Change the view mode of the current scaffold
     */
    changeViewingMode: function (modeName) {
      if (this.$refs.scaffold) {
        this.$refs.scaffold.changeViewingMode(modeName);
      }
    },
    updateViewerSettings: function () {
      if (this.$refs.scaffold) {
        const {
          backgroundDisplay,
          organsDisplay,
          outlinesDisplay,
          viewingMode,
        } = this.settingsStore.globalSettings;
        this.$refs.scaffold.backgroundChangeCallback(backgroundDisplay);
        this.$refs.scaffold.changeViewingMode(viewingMode);
        this.$refs.scaffold.setColour(organsDisplay);
        this.$refs.scaffold.setOutlines(outlinesDisplay);
      }
    },
  },
  computed: {
    warningMessage: function() {
      if ((this.entry.discoverId === '307' || this.entry.discoverId === 307)) {
        return "This map displays the anatomical location and connectivity of nerves, through which the neuron populations from the ApiNATOMY models available in SCKAN can be routed.";
      } else {
        return "Under active development";
      }
    },
    markerLabels: function () {
      return this.settingsStore.globalSettings.displayMarkers ? this.settingsStore.numberOfDatasetsForFacets : {};
    },
  },
  watch: {
    visible: {
      handler(visible) {
        // Only activate scaffoldvuer when the pane becomes active
        if (visible && (!this.activated)) {
          this.activated = true;
          this.$nextTick(() => {
            if (this.$refs.scaffold) {
              this.scaffoldRef = markRaw(this.$refs.scaffold);
              if (this.scaffoldRef) {
                this.loadExplorerConfig();
                this.connectivityKnowledge = this.connectivitiesStore.globalConnectivities;
                this.connectivityFilterOptions = this.connectivitiesStore.filterOptions;
                this.connectivityFilterSources = this.connectivitiesStore.filterSources;
              }
            }
          });
        }
      },
      deep: true,
      immediate: true,
    },
    connectivityKnowledge: {
      handler(newVal, oldVal) {
        // Store scaffold knowledge locally
        if (this.entry.resource in newVal) {
          const scaffoldKnowledge = newVal[this.entry.resource];
          if (scaffoldKnowledge.length !== this.nervesKnowledge.length) {
            this.nervesKnowledge = scaffoldKnowledge;
            if (this.scaffoldLoaded) {
              this.setNerveGreyScale();
            }
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  data: function () {
    return {
      activated: false,
      apiLocation: process.env.VUE_APP_API_LOCATION,
      scaffoldCamera: undefined,
      scaffoldLoaded: false,
      nervesKnowledge: [],
      clickedObject: undefined,
      filter: [],
      query: '',
    };
  },
};
</script>

<style scoped lang="scss">
.viewer-container {
  width: 100%;
  height: 100%;
}

:deep(.message-popper) {
  white-space: unset;
  max-width: 200px;
}
</style>
