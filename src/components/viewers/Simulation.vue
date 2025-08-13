<template>
  <OpenCOR
    v-if="entry.resource"
    :omex="entry.resource"
    ref="simulation"
  />
  <SimulationVuer
    v-else
    :id="this.entry.discoverId"
    ref="simulation"
  />
</template>

<script>
/* eslint-disable no-alert, no-console */
import ContentMixin from "../../mixins/ContentMixin";
import { SimulationVuer } from "@abi-software/simulationvuer";
import "@abi-software/simulationvuer/dist/style.css";
import OpenCOR from '@opencor/opencor'
import '@opencor/opencor/style.css'

export default {
  name: "Simulation",
  mixins: [ ContentMixin ],
  components: {
    OpenCOR,
    SimulationVuer,
  },
};
</script>
