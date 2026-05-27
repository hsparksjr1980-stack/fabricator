export type MaterialKind = 'wood' | 'steel' | 'aluminum';

export type RoughMaterialEstimateInput = {
  materialKind: MaterialKind;
  lengthFeet: number;
  widthInches: number;
  thicknessInches: number;
  quantity: number;
  wastePercent: number;
};

const densityLbPerCubicInch: Record<MaterialKind, number> = {
  wood: 0.022,
  steel: 0.284,
  aluminum: 0.0975,
};

export function estimateRoughMaterial(input: RoughMaterialEstimateInput) {
  const lengthInches = Math.max(input.lengthFeet, 0) * 12;
  const width = Math.max(input.widthInches, 0);
  const thickness = Math.max(input.thicknessInches, 0);
  const quantity = Math.max(input.quantity, 1);
  const wasteMultiplier = 1 + Math.max(input.wastePercent, 0) / 100;

  const rawVolume = lengthInches * width * thickness * quantity;
  const volumeWithWaste = rawVolume * wasteMultiplier;
  const estimatedWeight = volumeWithWaste * densityLbPerCubicInch[input.materialKind];
  const linearFeetWithWaste = input.lengthFeet * quantity * wasteMultiplier;
  const boardFeet = input.materialKind === 'wood' ? (lengthInches * width * thickness * quantity) / 144 * wasteMultiplier : 0;

  return {
    linearFeet: Number(linearFeetWithWaste.toFixed(1)),
    volumeCubicInches: Number(volumeWithWaste.toFixed(1)),
    estimatedWeightLb: Number(estimatedWeight.toFixed(1)),
    boardFeet: Number(boardFeet.toFixed(1)),
    wastePercent: input.wastePercent,
  };
}
