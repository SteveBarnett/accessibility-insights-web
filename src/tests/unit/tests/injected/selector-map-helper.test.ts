// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AssessmentsProvider } from 'assessments/types/assessments-provider';
import { UnifiedResult, UnifiedRule } from 'common/types/store-data/unified-data-interface';
import { GetElementBasedViewModelCallback } from 'injected/element-based-view-model-creator';
import { AssessmentVisualizationInstance } from 'injected/frameCommunicators/html-element-axe-results-helper';
import { exampleUnifiedResult } from 'tests/unit/tests/common/components/cards/sample-view-model-data';
import { IMock, Mock } from 'typemoq';

import { ManualTestStatus } from '../../../../common/types/manual-test-status';
import {
    AssessmentStoreData,
    GeneratedAssessmentInstance,
    InstanceIdToInstanceDataMap,
    TestStepResult,
} from '../../../../common/types/store-data/assessment-result-data';
import { VisualizationType } from '../../../../common/types/visualization-type';
import { SelectorMapHelper, VisualizationRelatedStoreData } from '../../../../injected/selector-map-helper';
import { CreateTestAssessmentProvider } from '../../common/test-assessment-provider';
import { VisualizationScanResultStoreDataBuilder } from '../../common/visualization-scan-result-store-data-builder';

describe('SelectorMapHelperTest', () => {
    let assessmentsProvider: AssessmentsProvider;
    let testSubject: SelectorMapHelper;
    let getElementBasedViewModelMock: IMock<GetElementBasedViewModelCallback>;

    const adHocVisualizationTypes = [VisualizationType.Headings, VisualizationType.Landmarks, VisualizationType.Color];
    beforeEach(() => {
        assessmentsProvider = CreateTestAssessmentProvider();
        getElementBasedViewModelMock = Mock.ofType<GetElementBasedViewModelCallback>();
        testSubject = new SelectorMapHelper(assessmentsProvider, getElementBasedViewModelMock.object);
    });

    test('constructor', () => {
        expect(new SelectorMapHelper(null, null)).toBeDefined();
    });

    adHocVisualizationTypes.forEach(visualizationType => {
        test(`getSelectorMap: ${VisualizationType[visualizationType]}`, () => {
            const selectorMap = { key1: { target: ['element1'] } };
            const state = new VisualizationScanResultStoreDataBuilder().withSelectorMap(visualizationType, selectorMap).build();
            const storeData: VisualizationRelatedStoreData = {
                visualizationScanResultStoreData: state,
            } as VisualizationRelatedStoreData;
            expect(testSubject.getSelectorMap(visualizationType, null, storeData)).toEqual(selectorMap);
        });
    });

    test('getState: issues', () => {
        const selectorMap = { key1: { target: ['element1'] } as AssessmentVisualizationInstance };
        const rulesStub: UnifiedRule[] = [{ id: 'some rule' } as UnifiedRule];
        const resultsStub: UnifiedResult[] = [exampleUnifiedResult];
        const unifiedScanData = {
            rules: rulesStub,
            results: resultsStub,
        };
        const storeData: VisualizationRelatedStoreData = {
            unifiedScanResultStoreData: unifiedScanData,
            cardSelectionStoreData: {},
        } as VisualizationRelatedStoreData;

        getElementBasedViewModelMock
            .setup(gebvm => gebvm(rulesStub, resultsStub, storeData.cardSelectionStoreData))
            .returns(() => selectorMap);

        expect(testSubject.getSelectorMap(VisualizationType.Issues, null, storeData)).toEqual(selectorMap);
    });

    test('getState: tabStops', () => {
        const visualizationType = VisualizationType.TabStops;
        const state = new VisualizationScanResultStoreDataBuilder().build();

        state.tabStops.tabbedElements = [];
        const storeData: VisualizationRelatedStoreData = {
            visualizationScanResultStoreData: state,
        } as VisualizationRelatedStoreData;
        expect(testSubject.getSelectorMap(visualizationType, null, storeData)).toEqual([]);
    });

    test('getState for assessment, selector map is not null', () => {
        const assessment = assessmentsProvider.all()[0];
        const visualizationType = assessment.visualizationType;
        const firstStep = assessment.requirements[0];

        const selectorMap: InstanceIdToInstanceDataMap = {
            key1: {
                target: ['element1'],
                testStepResults: {
                    step1: {
                        status: ManualTestStatus.FAIL,
                        isVisualizationEnabled: true,
                    } as TestStepResult,
                },
                ruleResults: null,
                html: null,
            } as GeneratedAssessmentInstance,
            [assessment.key]: {
                target: ['element2'],
                testStepResults: {
                    [firstStep.key]: {
                        status: ManualTestStatus.FAIL,
                        isVisualizationEnabled: true,
                    } as TestStepResult,
                },
                html: 'html',
                propertyBag: {},
            } as GeneratedAssessmentInstance,
        };

        const state = {
            assessments: {
                [assessment.key]: {
                    generatedAssessmentInstancesMap: selectorMap,
                },
            },
        } as AssessmentStoreData;
        const storeData: VisualizationRelatedStoreData = {
            assessmentStoreData: state,
        } as VisualizationRelatedStoreData;

        const result = testSubject.getSelectorMap(visualizationType, firstStep.key, storeData);

        const expectedSelectedMap = {
            [assessment.key]: {
                isFailure: true,
                isVisualizationEnabled: true,
                propertyBag: {},
                target: ['element2'],
                ruleResults: null,
            },
        };

        expect(result).toEqual(expectedSelectedMap);
    });

    test('getState for assessment: selectorMap null', () => {
        const assessment = assessmentsProvider.all()[0];
        const visualizationType = assessment.visualizationType;
        const firstStep = assessment.requirements[0];

        const selectorMap = null;
        const state = {
            assessments: {
                [assessment.key]: {
                    generatedAssessmentInstancesMap: selectorMap,
                },
            },
        } as AssessmentStoreData;

        const storeData: VisualizationRelatedStoreData = {
            assessmentStoreData: state,
        } as VisualizationRelatedStoreData;

        const result = testSubject.getSelectorMap(visualizationType, firstStep.key, storeData);

        expect(result).toBeNull();
    });
});
