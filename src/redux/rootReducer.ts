import { combineReducers } from '@reduxjs/toolkit';

import placesReducer from './slices/placesSlice';
import inventoryReducer from './slices/inventorySlice';

const rootReducer = combineReducers({
  places: placesReducer,
  inventory: inventoryReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
