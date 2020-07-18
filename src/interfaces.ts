import { PLACES_IDS } from './constants';
export interface IPlace {
  id: string;
  name: string;
  parts: string[] | undefined;
}

export interface IInventory {
  id: string;
  name: string;
  count: number;
  placeId: string;
}
