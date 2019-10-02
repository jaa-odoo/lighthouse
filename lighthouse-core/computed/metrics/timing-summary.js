/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('../../audits/audit.js');
const TraceOfTab = require('../trace-of-tab.js');
const Speedline = require('../speedline.js');
const FirstContentfulPaint = require('./first-contentful-paint.js');
const FirstMeaningfulPaint = require('./first-meaningful-paint.js');
const FirstCPUIdle = require('./first-cpu-idle.js');
const Interactive = require('./interactive.js');
const SpeedIndex = require('./speed-index.js');
const EstimatedInputLatency = require('./estimated-input-latency.js');
const TotalBlockingTime = require('./total-blocking-time.js');

class TimingSummary {
  /**
     * @param {LH.Artifacts} artifacts
     * @param {LH.Audit.Context} context
     * @return {Promise<LH.Artifacts.TimingSummary>}
     */
  static async summarize(artifacts, context) {
    const trace = artifacts.traces[Audit.DEFAULT_PASS];
    const devtoolsLog = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const settings = context.settings;
    const metricComputationData = {trace, devtoolsLog, settings};

    /**
     * @template TArtifacts
     * @template TReturn
     * @param {{request: (artifact: TArtifacts, context: LH.Audit.Context) => Promise<TReturn>}} Artifact
     * @param {TArtifacts} artifact
     * @return {Promise<TReturn|undefined>}
     */
    const requestOrUndefined = (Artifact, artifact) => {
      return Artifact.request(artifact, context).catch(_ => undefined);
    };

    const traceOfTab = await TraceOfTab.request(trace, context);
    const speedline = await Speedline.request(trace, context);
    const firstContentfulPaint = await FirstContentfulPaint.request(metricComputationData, context);
    const firstMeaningfulPaint = await FirstMeaningfulPaint.request(metricComputationData, context);
    const firstCPUIdle = await requestOrUndefined(FirstCPUIdle, metricComputationData);
    const interactive = await requestOrUndefined(Interactive, metricComputationData);
    const speedIndex = await requestOrUndefined(SpeedIndex, metricComputationData);
    const estimatedInputLatency = await EstimatedInputLatency.request(metricComputationData, context); // eslint-disable-line max-len
    const totalBlockingTime = await TotalBlockingTime.request(metricComputationData, context); // eslint-disable-line max-len

    /** @type {LH.Artifacts.TimingSummary} */
    return {
      // Include the simulated/observed performance metrics
      firstContentfulPaint: firstContentfulPaint.timing,
      firstContentfulPaintTs: firstContentfulPaint.timestamp,
      firstMeaningfulPaint: firstMeaningfulPaint.timing,
      firstMeaningfulPaintTs: firstMeaningfulPaint.timestamp,
      firstCPUIdle: firstCPUIdle && firstCPUIdle.timing,
      firstCPUIdleTs: firstCPUIdle && firstCPUIdle.timestamp,
      interactive: interactive && interactive.timing,
      interactiveTs: interactive && interactive.timestamp,
      speedIndex: speedIndex && speedIndex.timing,
      speedIndexTs: speedIndex && speedIndex.timestamp,
      estimatedInputLatency: estimatedInputLatency.timing,
      estimatedInputLatencyTs: estimatedInputLatency.timestamp,
      totalBlockingTime: totalBlockingTime.timing,

      // Include all timestamps of interest from trace of tab
      observedNavigationStart: traceOfTab.timings.navigationStart,
      observedNavigationStartTs: traceOfTab.timestamps.navigationStart,
      observedFirstPaint: traceOfTab.timings.firstPaint,
      observedFirstPaintTs: traceOfTab.timestamps.firstPaint,
      observedFirstContentfulPaint: traceOfTab.timings.firstContentfulPaint,
      observedFirstContentfulPaintTs: traceOfTab.timestamps.firstContentfulPaint,
      observedFirstMeaningfulPaint: traceOfTab.timings.firstMeaningfulPaint,
      observedFirstMeaningfulPaintTs: traceOfTab.timestamps.firstMeaningfulPaint,
      observedTraceEnd: traceOfTab.timings.traceEnd,
      observedTraceEndTs: traceOfTab.timestamps.traceEnd,
      observedLoad: traceOfTab.timings.load,
      observedLoadTs: traceOfTab.timestamps.load,
      observedDomContentLoaded: traceOfTab.timings.domContentLoaded,
      observedDomContentLoadedTs: traceOfTab.timestamps.domContentLoaded,

      // Include some visual metrics from speedline
      observedFirstVisualChange: speedline.first,
      observedFirstVisualChangeTs: (speedline.first + speedline.beginning) * 1000,
      observedLastVisualChange: speedline.complete,
      observedLastVisualChangeTs: (speedline.complete + speedline.beginning) * 1000,
      observedSpeedIndex: speedline.speedIndex,
      observedSpeedIndexTs: (speedline.speedIndex + speedline.beginning) * 1000,
    };
  }
}

module.exports = TimingSummary;
