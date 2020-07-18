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
  isLoading: boolean;
  error: string | null;
}

const inventoryInitialState: InventoryState = {
  inventoryByPlaceId: {},
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

      payload.forEach((inventory) => {
        const { placeId } = inventory;
        const whereTostore = state.inventoryByPlaceId;

        if (placeId in whereTostore) {
          whereTostore[placeId].push(inventory);
        } else {
          whereTostore[placeId] = [inventory];
        }
      });
    },
    postInventorySucess: loadInventorySucess,
    setInventorySucess: loadInventorySucess,
    deleteInventorySucess: loadInventorySucess,
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
    await postInventoryToDB(inventory);
    dispatch(postInventorySucess());
  } catch (error) {
    dispatch(postInventoryFailure(error.message));
  }
};

export const setInventory = (
  inventoryId: string,
  fields: { name?: string; count?: number }
): AppThunk => async (dispatch) => {
  try {
    dispatch(setInventoryStart());
    await setInventoryToDB(inventoryId, fields);
    dispatch(setInventorySucess());
  } catch (error) {
    dispatch(setInventoryFailure(error.message));
  }
};

export const deleteInventory = (inventoryId: string): AppThunk => async (
  dispatch
) => {
  try {
    dispatch(deleteInventoryStart());
    await deleteInventoryFromDB(inventoryId);
    dispatch(deleteInventorySucess());
  } catch (error) {
    dispatch(deleteInventoryFailure(error.message));
  }
};
