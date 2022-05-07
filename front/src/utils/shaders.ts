import { Light, Mesh, ShaderConfig } from 'src/types/shaders';
import { useSettingsStore } from 'src/stores/settings';
import { Coalition } from 'src/types';

const settings = useSettingsStore();

export const useLoginShaders = () => {
  const mesh: Mesh = {
    diffuse: '#1a41a0',
    ambient: '#040225',
    depth: 25,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2
  };

  const light: Light = {
    ambient: '#00a07a',
    diffuse: '#8baf19',
    count: 3,
    draw: true,
    zOffset: 100,
    autopilot: false
  }
  return {
    type: 'canvas',
    mesh,
    light
  } as ShaderConfig;;
}

export const useAllianceShaders = () => {
  const mesh: Mesh = {
    diffuse: '#34de00',
    ambient: '#7cc378',
    depth: 10,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2
  };

  const light: Light = {
    ambient: '#0e1b0b',
    diffuse: '#ffceb3',
    count: 3,
    draw: false,
    zOffset: 22,
    autopilot: true
  }
  return {
    type: 'svg',
    mesh,
    light
  } as ShaderConfig;
}

export const useAssemblyShaders = () => {
  const mesh: Mesh = {
    ambient: '#0c1c4d',
    diffuse: '#43338e',
    depth: 38,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2
  };

  const light: Light = {
    ambient: '#a74685',
    diffuse: '#c768d4',
    count: 3,
    draw: false,
    zOffset: 39,
    autopilot: true
  }
  return {
    type: 'svg',
    mesh,
    light
  } as ShaderConfig;
}

export const useFederationShaders = () => {
  const mesh: Mesh = {
    ambient: '#265075',
    diffuse: '#bea696',
    depth: 38,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2
  };

  const light: Light = {
    ambient: '#284859',
    diffuse: '#845e4a',
    count: 3,
    draw: false,
    zOffset: 39,
    autopilot: true
  }
  return {
    type: 'svg',
    mesh,
    light
  } as ShaderConfig;
}

export const useOrderShaders = () => {
  const mesh: Mesh = {
    ambient: '#980008',
    diffuse: '#d49625',
    depth: 38,
    segments: 16,
    slices: 8,
    width: 1.2,
    height: 1.2
  };

  const light: Light = {
    ambient: '#3e3020',
    diffuse: '#a48d86',
    count: 3,
    draw: false,
    zOffset: 39,
    autopilot: true
  }
  return {
    type: 'svg',
    mesh,
    light
  } as ShaderConfig;
}