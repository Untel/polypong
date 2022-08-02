import { Light, Mesh, ShaderConfig } from 'src/types/shaders';

const type = 'canvas';

export const defaultCoalitionLight = {
  count: 1,
  draw: false,
  zOffset: 100,
  autopilot: false,
};

export const defaultLoginLight = {
  count: 3,
  draw: false,
  zOffset: 100,
  autopilot: false,
};

export const useLoginShaders = () => {
  const mesh: Mesh = {
    ambient: '#040225',
    diffuse: '#1a41a0',
    depth: 25,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2,
  };

  const light: Light = {
    ambient: '#00a07a',
    diffuse: '#8baf19',
    ...defaultLoginLight,
  };
  return {
    type,
    mesh,
    light,
  } as ShaderConfig;
};

export const useLoginLightShaders = () => {
  const mesh: Mesh = {
    ambient: '#616161',
    diffuse: '#2560f0',
    depth: 25,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2,
  };

  const light: Light = {
    ambient: '#969696',
    diffuse: '#676963',
    count: 3,
    draw: true,
    zOffset: 100,
    autopilot: false,
  };
  return {
    type,
    mesh,
    light,
  } as ShaderConfig;
};

export const useAllianceShaders = () => {
  const mesh: Mesh = {
    diffuse: '#34de00',
    ambient: '#7cc378',
    depth: 10,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2,
  };

  const light: Light = {
    ambient: '#0e1b0b',
    diffuse: '#37460a',
    ...defaultCoalitionLight,
  };
  return {
    type,
    mesh,
    light,
  } as ShaderConfig;
};

export const useAssemblyShaders = () => {
  const mesh: Mesh = {
    ambient: '#0c1c4d',
    diffuse: '#43338e',
    depth: 10,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2,
  };

  const light: Light = {
    ambient: '#a74685',
    diffuse: '#c768d4',
    ...defaultCoalitionLight,
  };
  return {
    type,
    mesh,
    light,
  } as ShaderConfig;
};

export const useFederationShaders = () => {
  const mesh: Mesh = {
    ambient: '#265075',
    diffuse: '#4180DB',
    depth: 10,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2,
  };

  const light: Light = {
    ambient: '#284859',
    diffuse: '#845e4a',
    ...defaultCoalitionLight,
  };
  return {
    type,
    mesh,
    light,
  } as ShaderConfig;
};

export const useOrderShaders = () => {
  const mesh: Mesh = {
    ambient: '#980008',
    diffuse: '#d49625',
    depth: 10,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2,
  };

  const light: Light = {
    ambient: '#3e3020',
    diffuse: '#a48d86',
    ...defaultCoalitionLight,
  };
  return {
    type,
    mesh,
    light,
  } as ShaderConfig;
};
