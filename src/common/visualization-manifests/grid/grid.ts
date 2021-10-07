/*
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Resolve, VisualizationManifest } from "../../models/visualization-manifest/visualization-manifest";
import { emptySettingsConfig } from "../../models/visualization-settings/empty-settings-config";
import { Actions } from "../../utils/rules/actions";
import { Predicates } from "../../utils/rules/predicates";
import { visualizationDependentEvaluatorBuilder } from "../../utils/rules/visualization-dependent-evaluator";

export const GRID_LIMITS = [50, 100, 200, 500, 1000];

const rulesEvaluator = visualizationDependentEvaluatorBuilder
  .when(Predicates.noSplits())
  .then(Actions.manualDimensionSelection("The Grid requires at least one split"))

  .when(Predicates.noSelectedMeasures())
  .then(Actions.manualMeasuresSelection())

  .otherwise(({ isSelectedVisualization, splits }) => {
    const firstSplit = splits.getSplit(0);
    const { limit: firstLimit } = firstSplit;
    const safeFirstLimit = GRID_LIMITS.indexOf(firstLimit) === -1 ? GRID_LIMITS[0] : firstLimit;

    const newSplits = splits.replace(firstSplit, firstSplit.changeLimit(safeFirstLimit));

    if (splits.equals(newSplits)) {
      return Resolve.ready(isSelectedVisualization ? 10 : 4);
    }
    return Resolve.automatic(6, { splits: newSplits });
  })
  .build();

export const GRID_MANIFEST = new VisualizationManifest(
  "grid",
  "[BETA] Grid",
  rulesEvaluator,
  emptySettingsConfig
);
