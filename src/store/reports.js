import { atom, useRecoilState } from 'recoil';
import * as dayjs from 'dayjs';

export const filterState = atom({
    key: 'filterState',
    default: [
        dayjs().startOf('month'),
        dayjs()
    ]
});

export const filterStateSingleDate = atom({
    key: 'filterStateSingleDate',
    default: dayjs()
});