// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DrawerUtils } from './drawer-utils';
import { ICircleConfiguration, ILineConfiguration, IStrokeConfiguration, ITextConfiguration } from './iformatter';
import { IPoint } from './ipoint';
import { SVGNamespaceUrl } from './svg-constants';

export class SVGShapeFactory {
    private drawerUtils: DrawerUtils;
    private readonly lineCssClassName = 'insights-svg-line';
    private readonly lineBuffer: number = 4;

    constructor(drawerUtils: DrawerUtils) {
        this.drawerUtils = drawerUtils;
    }

    public createLine(
        source: IPoint,
        destination: IPoint,
        configuration: ILineConfiguration,
        filterName: string,
        circleRadius: number,
    ): Element {
        const myDocument = this.drawerUtils.getDocumentElement();
        const line = myDocument.createElementNS(SVGNamespaceUrl, 'line');

        line.setAttributeNS(null, 'class', this.lineCssClassName);

        const adjustedSourcePoint = this.getAdjustedPoint(source, destination, circleRadius + this.lineBuffer);
        line.setAttributeNS(null, 'x1', adjustedSourcePoint.x.toString());
        line.setAttributeNS(null, 'y1', adjustedSourcePoint.y.toString());

        const adjustedDestinationPoint = this.getAdjustedPoint(destination, source, circleRadius + this.lineBuffer);
        line.setAttributeNS(null, 'x2', adjustedDestinationPoint.x.toString());
        line.setAttributeNS(null, 'y2', adjustedDestinationPoint.y.toString());

        this.applyStrokeConfiguration(line, configuration);

        line.setAttributeNS(null, 'filter', `url(#${filterName})`);

        return line;
    }

    public applyStrokeConfiguration(element: Element, configuration: IStrokeConfiguration): void {
        element.setAttributeNS(null, 'stroke', configuration.stroke);
        element.setAttributeNS(null, 'stroke-width', configuration.strokeWidth);

        if (configuration.strokeDasharray != null) {
            element.setAttributeNS(null, 'stroke-dasharray', configuration.strokeDasharray);
        } else {
            element.removeAttributeNS(null, 'stroke-dasharray');
        }
    }

    public createCircle(center: IPoint, configuration: ICircleConfiguration): Element {
        const myDocument = this.drawerUtils.getDocumentElement();

        const circle = myDocument.createElementNS(SVGNamespaceUrl, 'ellipse');

        circle.setAttributeNS(null, 'class', 'insights-svg-focus-indicator');
        circle.setAttributeNS(null, 'cx', center.x.toString());
        circle.setAttributeNS(null, 'cy', center.y.toString());

        this.applyCircleConfiguration(circle, configuration);

        return circle;
    }

    public createTabIndexLabel(center: IPoint, textConfig: ITextConfiguration, tabOrder: number): Element {
        const myDocument = this.drawerUtils.getDocumentElement();
        const text = myDocument.createElementNS(SVGNamespaceUrl, 'text');

        text.setAttributeNS(null, 'class', 'insights-svg-focus-indicator-text');

        text.setAttributeNS(null, 'x', center.x.toString());
        text.setAttributeNS(null, 'y', (center.y + 5).toString());

        text.setAttributeNS(null, 'fill', textConfig.fontColor);
        text.setAttributeNS(null, 'text-anchor', textConfig.textAnchor);

        text.innerHTML = tabOrder.toString();

        return text;
    }

    private applyCircleConfiguration(element: Element, configuration: ICircleConfiguration): void {
        element.setAttributeNS(null, 'rx', configuration.ellipseRx);
        element.setAttributeNS(null, 'ry', configuration.ellipseRy);

        const fill: string = configuration.fill;
        element.setAttributeNS(null, 'fill', fill);

        this.applyStrokeConfiguration(element, configuration);
    }

    private getAdjustedPoint(source: IPoint, destination: IPoint, circleRadius: number): IPoint {
        const slope = (destination.y - source.y) / (destination.x - source.x);
        const angle = Math.atan2(destination.y - source.y, destination.x - source.x);

        const adjustedPoint: IPoint = {
            x: source.x + circleRadius * Math.cos(angle),
            y: source.y + circleRadius * Math.sin(angle),
        };

        return adjustedPoint;
    }
}