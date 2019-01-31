// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { VisualizationType } from '../../common/types/visualization-type';
import { AssessmentBuilder } from '../assessment-builder';
import * as Markup from '../markup';
import { IAssessment } from '../types/iassessment';
import { Cues } from './test-steps/cues';
import { Instructions } from './test-steps/instructions';
import { Label } from './test-steps/label';
import { WidgetFunction } from './test-steps/widget-function';
import { test as content } from '../../content/test';

const key = 'nativeWidgets';
const title = 'Native widgets';
const { guidance } = content.nativeWidgets;
const gettingStarted: JSX.Element = (
    <React.Fragment>
        <p>
            <Markup.Emphasis>Widgets</Markup.Emphasis> are interactive interface components, such as links, buttons, and combo boxes.
        </p>
        <Markup.Emphasis>Native widgets</Markup.Emphasis> include the following simple, interactive HTML elements:
        <ul>
            <li>button</li>
            <li>input</li>
            <li>select</li>
            <li>textarea</li>
        </ul>
        <p>
            However, native widgets can function as <Markup.Emphasis>custom widgets</Markup.Emphasis>. For example, a button might function
            as part of an accordion control or menu; or a text field, a button, and a listbox might function together as a combo box.
        </p>
        <p>Elements with valid widget roles are addressed in the Custom widgets test.</p>
    </React.Fragment>
);

export const NativeWidgetsAssessment: IAssessment = AssessmentBuilder.Assisted({
    key,
    type: VisualizationType.NativeWidgets,
    title,
    gettingStarted,
    guidance,
    steps: [WidgetFunction, Instructions, Label, Cues],
    storeDataKey: 'nativeWidgetsAssessment',
});