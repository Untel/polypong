import {
  useAllianceShaders, useAssemblyShaders, useFederationShaders, useOrderShaders,
} from 'src/utils/shaders';
import { ShaderConfig } from './shaders';

export interface Coalition {
  name: string;
  shaderConfig: ShaderConfig,
  fallback: string,
}

export enum CoalitionChoice {
  ALLIANCE = 'alliance',
  ORDER = 'order',
  FEDERATION = 'federation',
  ASSEMBLY = 'assembly',
}

export const coalitionsShadersMap = {
  [CoalitionChoice.ALLIANCE]: useAllianceShaders,
  [CoalitionChoice.ASSEMBLY]: useAssemblyShaders,
  [CoalitionChoice.FEDERATION]: useFederationShaders,
  [CoalitionChoice.ORDER]: useOrderShaders,
};

export const coalitionsFallbackMap = {
  [CoalitionChoice.ALLIANCE]: '/alliance_background.jpg',
  [CoalitionChoice.ASSEMBLY]: '/assembly_background.jpg',
  [CoalitionChoice.FEDERATION]: '/federation_background.jpg',
  [CoalitionChoice.ORDER]: '/order_background.jpg',
};

export const coalitions = {
  [CoalitionChoice.ALLIANCE]: {
    name: 'The alliance',
    shaderConfig: useAllianceShaders(),
    fssFallback: coalitionsFallbackMap[CoalitionChoice.ALLIANCE],
  },
  [CoalitionChoice.ASSEMBLY]: {
    name: 'The assembly',
    shaderConfig: useAssemblyShaders(),
    fssFallback: coalitionsFallbackMap[CoalitionChoice.ASSEMBLY],
  },
  [CoalitionChoice.FEDERATION]: {
    name: 'The federation',
    shaderConfig: useFederationShaders(),
    fssFallback: coalitionsFallbackMap[CoalitionChoice.FEDERATION],
  },
  [CoalitionChoice.ORDER]: {
    name: 'The order',
    shaderConfig: useOrderShaders(),
    fssFallback: coalitionsFallbackMap[CoalitionChoice.ORDER],
  },
};
