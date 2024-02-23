// badgesAtom.js
import { atom } from 'recoil';

export const badgesAtom = atom({
  key: 'badgesAtom',
  default: 0,
});

export const reloadAtom = atom({
    key: 'reloadAtom',
    default: 0,
  });