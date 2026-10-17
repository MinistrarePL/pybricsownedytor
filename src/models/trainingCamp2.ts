import type { RobotProfile } from '../types.ts';
import { legoPdf } from './assets.ts';
import { programFrom } from './builder.ts';
import type { ModelTemplate } from './types.ts';

export const TRAINING_CAMP_2_PROFILE: RobotProfile = {
  modelId: 'training-camp-2',
  name: 'Training Camp 2',
  devices: [
    { id: 'lewe_kolo', name: 'lewe koło', kind: 'motor', port: 'C', reversed: true },
    { id: 'prawe_kolo', name: 'prawe koło', kind: 'motor', port: 'D', reversed: false },
    { id: 'ramie', name: 'ramię', kind: 'motor', port: 'E', reversed: false },
    { id: 'odleglosc', name: 'czujnik odległości', kind: 'distanceSensor', port: 'F' },
  ],
  driveBase: {
    left: 'lewe_kolo',
    right: 'prawe_kolo',
    wheelDiameter: 56,
    axleTrack: 112,
    useGyro: true,
  },
};

export const trainingCamp2Model: ModelTemplate = {
  id: 'training-camp-2',
  name: 'Training Camp 2',
  description: 'Baza treningowa z ramieniem i czujnikiem odległości. Nadaje się do sterowania padem Xbox.',
  image: './models/training-camp-2.png',
  lessonUrl: 'https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-2-playing-with-objects/',
  pdfs: [
    {
      id: 'baza',
      label: 'Baza jezdna',
      url: legoPdf('blt06873e1b438a0d7e/5ec8e66f033ad5045f4c79a6/driving-base-bi-pdf-book1of1.pdf'),
    },
    {
      id: 'narzedzia',
      label: 'Ramię i akcesoria',
      url: legoPdf('blt4e022269eb67e4d6/5ec8e6ef694dd13eb3ffac29/driving-base-tools-accessories-bi-pdf-book1of1.pdf'),
    },
  ],
  profile: TRAINING_CAMP_2_PROFILE,
  workspaceNote: [
    'Kable jak w PDF LEGO: lewe koło C, prawe koło D, ramię E, czujnik odległości F.',
    'Żeby jeździć padem: przełącz na „Pilot pada”, sparuj Xbox z hubem i naciśnij zielony przycisk. Krzyżak góra/dół podnosi i opuszcza ramię.',
    'Jeśli coś nie działa, otwórz „Log huba” na dole — tam widać błędy z programu.',
  ],
  program: programFrom([
    { type: 'silnik_czas', fields: { URZ: 'ramie', KIER: 'lewo', SEK: 1 } },
    { type: 'silnik_obroc', fields: { URZ: 'ramie', KIER: 'prawo', KAT: 75 } },
    { type: 'dzwiek', fields: { TON: '250', SEK: 0.2 } },
    { type: 'dzwiek', fields: { TON: '500', SEK: 0.2 } },
  ]),
};
