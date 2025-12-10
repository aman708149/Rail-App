export function getTrainTypeClass(trainTypeCode: string | number) {
  const typeClassMap: { [key: string]: string } = {
    SP: 'special',
    R: 'rajdhani',
    ST: 'special-tatkal',
    G: 'garib-rath',
    JS: 'jan-shatabdi',
    S: 'shatabdi',
    D: 'duronto',
    O: 'others',
    VB : 'vande_bharat'
  };

  return typeClassMap[trainTypeCode] || 'others'; // Default to "others" if no match
}

type TrainTypeMap = {
  [key: string]: string;
};
const trainTypes: TrainTypeMap = {
  SP: 'SPECIAL TRAIN',
  R: 'RAJDHANI',
  ST: 'SPECIAL TATKAL',
  G: 'GARIB RATH',
  JS: 'JAN SHATABDI',
  S: 'SHATABDI',
  D: 'DURONTO',
  O: 'OTHERS',
  VB : 'VANDE BHARAT'
};

export const getTrainTypeText = (trainType: string) => {
  return trainTypes[trainType] || 'Other';
};