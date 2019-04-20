/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Budgets = require('../../config/budgets');
const assert = require('assert');
/* eslint-env jest */

describe('Budgets', () => {
  let budgetsJson;
  beforeEach(() => {
    budgetsJson = [{
      resourceSizes: [{
        resourceType: 'script',
        budget: 123,
      },
      {
        resourceType: 'image',
        budget: 456,
      }],
      resourceCounts: [{
        resourceType: 'total',
        budget: 100,
      },
      {
        resourceType: 'third-party',
        budget: 10,
      }],
      timings: [{
        metric: 'time-to-interactive',
        budget: 2000,
        tolerance: 1000,
      },
      {
        metric: 'first-contentful-paint',
        budget: 1000,
        tolerance: 500,
      }],
    },
    {
      resourceSizes: [
        {
          resourceType: 'script',
          budget: 1000,
        },
      ],
    }];
  });
  it('initializes correctly', () => {
    const budgets = Budgets.parseBudgets(budgetsJson);
    assert.equal(budgets.length, 2);

    // Sets resources sizes correctly
    assert.equal(budgets[0].resourceSizes.length, 2);
    assert.equal(budgets[0].resourceSizes[0].resourceType, 'script');
    assert.equal(budgets[0].resourceSizes[0].budget, 123);

    // Sets resource counts correctly
    assert.equal(budgets[0].resourceCounts.length, 2);
    assert.equal(budgets[0].resourceCounts[0].resourceType, 'total');
    assert.equal(budgets[0].resourceCounts[0].budget, 100);

    // Sets timings correctly
    assert.equal(budgets[0].timings.length, 2);
    assert.equal(budgets[0].timings[1].metric, 'first-contentful-paint');
    assert.equal(budgets[0].timings[1].budget, 1000);
    assert.equal(budgets[0].timings[1].tolerance, 500);

    // Does not set unsupplied budgets
    assert.equal(budgets[1].timings, null);
  });
  it('throws error if an unsupported budget property is used', () => {
    budgetsJson[0].sizes = [];
    assert.throws(_ => Budgets.parseBudgets(budgetsJson), /[sizes]/);
  });
  describe('resource budget validation', () => {
    it('throws when an invalid resource type is supplied', () => {
      budgetsJson[0].resourceSizes[0].resourceType = 'movies';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /Invalid resource type/);
    });
    it('throws when an invalid budget is supplied', () => {
      budgetsJson[0].resourceSizes[0].budget = '100 MB';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /Invalid budget/);
    });
    it('throws when an invalid property is supplied', () => {
      budgetsJson[0].resourceSizes[0].browser = 'Chrome';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /[browser]/);
    });
  });
  describe('timing budget validation', () => {
    it('throws when an invalid metric is supplied', () => {
      budgetsJson[0].timings[0].metric = 'lastMeaningfulPaint';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /Invalid timing metric/);
    });
    it('throws when an invalid budget is supplied', () => {
      budgetsJson[0].timings[0].budget = '100KB';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /Invalid budget/);
    });
    it('throws when an invalid tolerance is supplied', () => {
      budgetsJson[0].timings[0].tolerance = '100ms';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /Invalid tolerance/);
    });
    it('throws when an invalid property is supplied', () => {
      budgetsJson[0].timings[0].device = 'Phone';
      assert.throws(_ => Budgets.parseBudgets(budgetsJson), /[device]/);
    });
  });
});
