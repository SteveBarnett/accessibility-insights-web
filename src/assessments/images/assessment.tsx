// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { VisualizationType } from '../../common/types/visualization-type';
import { AssessmentBuilder } from '../assessment-builder';
import { IAssessment } from '../types/iassessment';
import { Captchas } from './test-steps/captchas';
import { ImageFunction } from './test-steps/image-function';
import { TextAlternative } from './test-steps/text-alternative';
import { ImagesOfText } from './test-steps/images-of-text';
import { test as content } from '../../content/test';

const key = 'images';
const title = 'Images';
const { guidance } = content.images;

const gettingStarted: JSX.Element = (
    <React.Fragment>
        Screen reader software cannot interpret images. The software will, however, read text that has been associated with images. The
        interpretation (meaning) of an image must be conveyed textually in the HTML (via the alt attribute associated with each img
        element).
    </React.Fragment>
);

export const ImagesAssessment: IAssessment = AssessmentBuilder.Assisted({
    key,
    type: VisualizationType.ImagesAssessment,
    title,
    gettingStarted,
    guidance,
    steps: [ImageFunction, TextAlternative, ImagesOfText, Captchas],
    storeDataKey: 'imageAssessment',
});