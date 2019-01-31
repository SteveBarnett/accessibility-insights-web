// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { VisualizationType } from '../../common/types/visualization-type';
import { AssessmentBuilder } from '../assessment-builder';
import { IAssessment } from '../types/iassessment';
import { PageTitle } from './test-steps/page-title';
import { FrameTitle } from './test-steps/frame-titles';
import { GeneralNavigation } from './test-steps/general-navigation';
import { test as content } from '../../content/test';

const key = 'page';
const pageAssessmentTitle = 'Page navigation';
const { guidance } = content.page;

const pageGettingStartedText: JSX.Element = (
    <p>This test addresses a variety of page-level requirements that ensure users can find the pages they want.</p>
);

export const PageAssessment: IAssessment = AssessmentBuilder.Assisted({
    key,
    type: VisualizationType.PageAssessment,
    gettingStarted: pageGettingStartedText,
    title: pageAssessmentTitle,
    guidance,
    steps: [PageTitle, FrameTitle, GeneralNavigation],
    storeDataKey: 'pageAssessment',
});