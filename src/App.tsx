import React, { useEffect } from 'react';

import { RootState } from './redux/rootReducer';
import { fetchPlaces } from './redux/slices/placesSlice';
import { fetchInventory } from './redux/slices/inventorySlice';

import { useSelector, useDispatch } from 'react-redux';
import { PlacesTree } from './components/PlacesTree/PlacesTree';
import { InventoryTabel } from './components/InventoryTable/InventoryTable';

import { db, setInventory, getInventory } from './services/firestore';

import styles from './App.module.css';
import { IInventory } from './interfaces';
// (async () => {
// await setInventory('aKA0l5QF3uzxz0577zhg', { count: 10 });
// console.log(await getInventory());
//   await db
//     .collection('inventory')
//     .get()
//     .then((response) => {
//       let docs = response.docs.map((x) => ({
//         id: x.id,
//         name: x.data().name,
//         count: x.data().count,
//         placeId: x.data().place ? x.data().place.id : undefined,
//       }));
//       console.info(docs);
//     });
// })();

export const App: React.FC = () => {
  const dispatch = useDispatch();

  const places = useSelector((state: RootState) => {
    return state.places.placeById;
  });

  const activePlaceId = useSelector((state: RootState) => {
    return state.places.activePlaceId;
  });

  // const inventoryByplaceId: Record<string, IInventory[]> = useSelector(
  //   (state: RootState) => {
  //     return Object.values(state.inventory.inventoryById).reduce(
  //       (acc: Record<string, IInventory[]>, inventoryEntity) => {
  //         const { placeId } = inventoryEntity;
  //         if (acc[placeId]) {
  //           return { ...acc, [placeId]: [...acc[placeId], inventoryEntity] };
  //         }
  //         return { ...acc, [placeId]: [inventoryEntity] };
  //       },
  //       {}
  //     );
  //   }
  // );

  const inventory = useSelector((state: RootState) => {
    return state.inventory.inventoryByPlaceId;
  });

  useEffect(() => {
    dispatch(fetchPlaces());
    dispatch(fetchInventory());
  }, []);

  return (
    <div className='App'>
      <main className={styles.main}>
        <aside className={styles.aside}>
          <PlacesTree places={places} inventory={inventory} />
        </aside>
        <section className={styles.tableSection}>
          {activePlaceId && (
            <InventoryTabel
              places={places}
              inventory={inventory}
              activePlaceId={activePlaceId}
            />
          )}
        </section>
      </main>
    </div>
  );
};
