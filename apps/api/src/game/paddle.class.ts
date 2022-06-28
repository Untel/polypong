import { Circle, Vector } from 'collider2d';
import { Line, lineAngle, Point, lineInterpolate } from 'geometric';
import GameTools from './gametools.class';
export default class Paddle {
    color: string;
    line: Line;
    interpolationStart: Function;
    interpolationEnd: Function;
    width: number;
    angle: number;
    index: number;
    bounceAngle: number;
    ratio: number;

    constructor(axis: Line, index: number, width = 0.2, bounce = 45) {
        this.width = width;
        this.index = index;
        this.color = GameTools.colors[index % GameTools.colors.length];
        this.angle = lineAngle(axis);
        this.bounceAngle = bounce;
        // On cree un sous line sur laquelle le paddle va pouvoir glisser
        // qui correspond a 1 - width% de la line actuelle (+ width% de taille du Paddle)
        const preInterpolate = lineInterpolate(axis);
        const effectiveAxisStart: Line = [axis[0], preInterpolate(1 - this.width)];
        const effectiveAxisEnd: Line = [preInterpolate(this.width), axis[1]];
        this.interpolationStart = lineInterpolate(effectiveAxisStart);
        this.interpolationEnd = lineInterpolate(effectiveAxisEnd);
        this.updatePercentOnAxis(0.5);
    }

    updatePercentOnAxis(ratio: number) {
        this.ratio = ratio;
        const newPosStart = this.interpolationStart(ratio);
        const newPosEnd = this.interpolationEnd(ratio);
        this.line = [newPosStart, newPosEnd];
    }

    public get netScheme() {
        return {
            line: this.line,
            color: this.color,
            // angle: this.angle,
        };
    }
}
