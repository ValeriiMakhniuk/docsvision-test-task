import { PLACES_IDS } from './constants';
export interface IPlace {
  id: string;
  name: string;
  parts: string[] | undefined;
  [key: string]: string | string[] | undefined;
}

export interface IInventory {
  [key: string]: string | number;
  id: string;
  name: string;
  count: number;
  placeId: string;
}
