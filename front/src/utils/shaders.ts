import { Light, Mesh } from 'src/types/shaders';

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
    type: process.env.SHADER_DEFAULT_RENDERER || 'svg',
    mesh,
    light
  };
}