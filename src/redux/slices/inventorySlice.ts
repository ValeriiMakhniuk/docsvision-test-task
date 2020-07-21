import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';

import { IInventory } from './../../interfaces';
import {
  getInventory as getInventoryFromDB,
  postInventory as postInventoryToDB,
  setInventory as setInventoryToDB,
  deleteInventory as deleteInventoryFromDB,
  ModelInventory,
} from '../../services/firestore';

interface InventoryState {
  inventoryByPlaceId: Record<string, IInventory[]>;
  inventoryById: Record<string, IInventory>;
  isLoading: boolean;
  error: string | null;
}

const inventoryInitialState: InventoryState = {
  inventoryByPlaceId: {},
  inventoryById: {},
  isLoading: false,
  error: null,
};

function startLoading(state: InventoryState) {
  state.isLoading = true;
}

function loadingFailed(state: InventoryState, action: PayloadAction<string>) {
  state.isLoading = false;
  state.error = action.payload;
}

function loadInventorySucess(state: InventoryState) {
  state.isLoading = false;
  state.error = null;
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: inventoryInitialState,
  reducers: {
    getInventoryStart: startLoading,
    postInventoryStart: startLoading,
    setInventoryStart: startLoading,
    deleteInventoryStart: startLoading,
    getInventorySucess(state, { payload }: PayloadAction<IInventory[]>) {
      state.isLoading = false;
      state.error = null;

      const byPlaceId = state.inventoryByPlaceId;
      const byId = state.inventoryById;

      payload.forEach((inventory) => {
        const { id, placeId } = inventory;

        byId[id] = inventory;
      });

      Object.values(state.inventoryById).forEach((inventory) => {
        const { placeId } = inventory;
        if (placeId in byPlaceId) {
          byPlaceId[placeId].push(inventory);
        } else {
          byPlaceId[placeId] = [inventory];
        }
      });
    },
    postInventorySucess(
      state,
      { payload }: PayloadAction<{ id: string; inventory: ModelInventory }>
    ) {
      state.error = null;
      const { id, inventory } = payload;
      const { name, count, place } = inventory;

      if (!state.inventoryByPlaceId[place.id]) {
        state.inventoryByPlaceId[place.id] = [
          {
            id,
            name,
            count,
            placeId: place.id,
          },
        ];
      } else {
        state.inventoryByPlaceId[place.id].push({
          id,
          name,
          count,
          placeId: place.id,
        });
      }
    },
    setInventorySucess(
      state,
      {
        payload,
      }: PayloadAction<{
        placeId: string;
        id: string;
        fields: { name: string; count: number };
      }>
    ) {
      state.error = null;

      const {
        placeId,
        id,
        fields: { name, count },
      } = payload;

      const targetInventory = state.inventoryByPlaceId[placeId].find(
        (inventory) => inventory.id === id
      );

      if (targetInventory) {
        targetInventory.name = name;
        targetInventory.count = count;
      }
    },
    deleteInventorySucess(
      state,
      { payload }: PayloadAction<{ placeId: string; id: string }>
    ) {
      const { placeId, id: inventoryId } = payload;

      state.inventoryByPlaceId[placeId] = state.inventoryByPlaceId[
        placeId
      ].filter(({ id }) => {
        return id !== inventoryId;
      });
    },
    getInventoryFailure: loadingFailed,
    postInventoryFailure: loadingFailed,
    setInventoryFailure: loadingFailed,
    deleteInventoryFailure: loadingFailed,
  },
});

export const {
  getInventoryStart,
  postInventoryStart,
  setInventoryStart,
  deleteInventoryStart,
  getInventorySucess,
  postInventorySucess,
  setInventorySucess,
  deleteInventorySucess,
  getInventoryFailure,
  postInventoryFailure,
  setInventoryFailure,
  deleteInventoryFailure,
} = inventorySlice.actions;
export default inventorySlice.reducer;

export const fetchInventory = (): AppThunk => async (dispatch) => {
  try {
    dispatch(getInventoryStart());
    const fetchedInvenory = await getInventoryFromDB();
    dispatch(getInventorySucess(fetchedInvenory));
  } catch (error) {
    dispatch(getInventoryFailure(error.message));
  }
};

export const postInventory = (inventory: ModelInventory): AppThunk => async (
  dispatch
) => {
  try {
    dispatch(postInventoryStart());
    const id = await postInventoryToDB(inventory);
    dispatch(postInventorySucess({ id, inventory }));
  } catch (error) {
    dispatch(postInventoryFailure(error.message));
  }
};

export const setInventory = (
  placeId: string,
  inventoryId: string,
  fields: { name: string; count: number }
): AppThunk => async (dispatch) => {
  try {
    dispatch(setInventoryStart());
    await setInventoryToDB(inventoryId, fields);
    dispatch(setInventorySucess({ placeId, id: inventoryId, fields }));
  } catch (error) {
    dispatch(setInventoryFailure(error.message));
  }
};

export const deleteInventory = (
  placeId: string,
  inventoryId: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(deleteInventoryStart());
    await deleteInventoryFromDB(inventoryId);
    dispatch(deleteInventorySucess({ placeId, id: inventoryId }));
  } catch (error) {
    dispatch(deleteInventoryFailure(error.message));
  }
};
