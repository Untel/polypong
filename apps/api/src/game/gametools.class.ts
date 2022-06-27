export default class GameTools {
    public static colors = ['red', 'blue', 'magenta', 'purple', 'green'];
    static lineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
        const s1_x = p1_x - p0_x;
        const s1_y = p1_y - p0_y;
        const s2_x = p3_x - p2_x;
        const s2_y = p3_y - p2_y;

        const s =
            (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
            (-s2_x * s1_y + s1_x * s2_y);
        const t =
            (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
            (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return {
                x: p0_x + t * s1_x,
                y: p0_y + t * s1_y,
            };
        }

        return null; // No collision
    }
    static getRandomArbitrary(min, max): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
    static getRandomFloatArbitrary(min, max): number {
        return Math.random() * (max - min) + min;
    }

    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
    }
    static percentage(small: number, big: number): number {
        return (small / big) * 100;
    }


}