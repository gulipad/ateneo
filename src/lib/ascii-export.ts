export type AsciiTransform = {
  fit: "contain" | "cover";
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
};

export type AsciiGeneration = {
  fontSize: number;
  aspectCorrection: number;
  contrast: number;
  whiteThreshold: number;
  edgeThreshold: number;
  varianceThreshold: number;
  complexity: number;
  ramp: string;
  transform: AsciiTransform;
};

export type AsciiEffects = {
  charDynamism: number;
  dynamismSpeed: number;
  whitespaceNoise: number;
  mouseExpandEnabled: boolean;
  mouseRadius: number;
  mouseStrength: number;
  glitchIntensity: number;
  noiseIntensity: number;
  scanlineIntensity: number;
};

export type AsciiRenderMetrics = {
  charWidthFactor: number;
  lineHeightFactor: number;
  paddingX: number;
  paddingY: number;
  foreground: string;
  background: string;
  fontFamily: string;
};

export type AsciiExport = {
  version: 1;
  label: string;
  createdAt: string;
  dimensions: {
    cols: number;
    rows: number;
  };
  asciiLines: string[];
  generation: AsciiGeneration;
  effects: AsciiEffects;
  render: AsciiRenderMetrics;
};
