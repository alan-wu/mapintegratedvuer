<template>
  <OpenCOR
    ref="opencorRef"
    theme="light"
  />
</template>

<script>
/* eslint-disable no-alert, no-console */
import OpenCOR from "@opencor/opencor";
import "@opencor/opencor/style.css";
import ContentMixin from "../../mixins/ContentMixin";
import EventBus from "../EventBus";

export default {
  name: "OpenCORView",
  mixins: [ ContentMixin ],
  components: {
    OpenCOR,
  },
  data: function () {
    return {
      params: undefined,
    }
  },
  methods: {
    updatePrimeInput: function(parent, labelText, newValue) {
      const labels = Array.from(parent.querySelectorAll('label'));
      const targetLabel = labels.find(el => el.textContent.includes(labelText));
      if (!targetLabel) {
        console.error(`Label "${labelText}" not found`);
        return;
      }
      const container = targetLabel.closest('.p-floatlabel');
      const input = container.querySelector('input');

      if (input) {
        input.value = newValue.toFixed(3);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    },
    hackParamsRequest: function(payload) {
      if (this.entry.id === payload.targetEntryId) {
        const data = payload.action;
        if (data.params) {
          this.params = {...data.params};
        }
        if (this.params && this.fileOpened) {
          const inputs = this.$refs.opencorRef.$el.querySelector('.p-fieldset.p-component .p-fieldset-content');
          Object.keys(this.params).forEach((key) => this.updatePrimeInput(inputs, key, this.params[key]));

        }
      }
    },
    hackAxisRequest: function(payload) {
      const {label, value} = payload;
      // Locate the Y Axis fieldset specifically
      const legends = Array.from(this.$refs.opencorRef.$el.querySelectorAll('.p-fieldset-legend-label'));
      const axisLegend = legends.find(el => el.textContent.trim() === label);
      if (!axisLegend) {
        console.error('Y Axis legend not found');
        return;
      }

      const fieldset = axisLegend.closest('.p-fieldset');
      const selectElement = fieldset.querySelector('.p-select');

      if (!selectElement) {
        console.error('Select dropdown not found.');
        return;
      }
      selectElement.click();
      this.$nextTick(() => {
        const options = Array.from(this.$refs.opencorRef.$el.querySelectorAll('.p-select-option, li[role="option"]'));
        const targetOption = options.find(opt => opt.textContent.trim() === value);
        if (targetOption) {
          targetOption.click();
          console.log(`Selected "${optionText}" for Y Axis`);
        } else {
          console.error(`Option "${optionText}" not found in dropdown list`);
        }
      });




      /*
      const fieldset = axisLegend.closest('.p-fieldset');
      const input = fieldset.querySelector('input.p-select-label');
      if (input) {
        // Focus, set value, and dispatch Vue event listeners
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        console.log(`Set Axis input text to "${value}"`);
      } else {
        console.error('Axis input element not found');
      }
      */
    },
  },
  mounted: function () {
    EventBus.on("opencor-set-axis", (payload) => {
      this.hackAxisRequest(payload);
    });
  }
};
</script>
