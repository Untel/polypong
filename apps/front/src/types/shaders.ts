import { FSS } from 'src/libs/fss';

export interface Mesh {
  width?: number; // float
  height?: number; // float
  depth?: number; // int
  segments?: number; // int
  slices?: number; // int
  xRange?: number; // float
  yRange?: number; // float
  zRange?: number; // float
  ambient?: string; // hexadecimal
  diffuse?: string; // hexadecimal
  speed?: number; // float
}

export interface Light {
  count?: number; // int
  xyScalar?: number; // int
  zOffset?: number; // int
  ambient?: string; // hexadecimal
  diffuse?: string; // hexadecimal
  speed?: number; // float
  gravity?: number; // int
  dampening?: number; // float
  minLimit?: number; // int
  maxLimit?: null,
  minDistance?: number; // int
  maxDistance?: number; // int
  autopilot?: boolean;
  draw?: boolean;
  bounds?: Record<string, unknown>; // FSS.vector3
  step?: Record<string, unknown>; // FSS.vector3
}

export interface ShaderConfig {
  mesh: Mesh;
  light: Light;
  type: 'svg' | 'canvas';
}
