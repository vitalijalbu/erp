import { atom, useRecoilState } from 'recoil';

export const currentUser = atom({
    key: 'currentUser',
    default: null
});
