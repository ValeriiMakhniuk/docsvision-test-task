import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { IPlace, IInventory } from './../interfaces';
import { PLACES_IDS } from '../constants';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

// Firestore Models (like it must be)

interface ModelPart {
  id: string;
}

interface ModelPlace {
  name: string;
  parts: ModelPart[] | undefined;
}

export interface ModelInventory {
  name: string;
  count: number;
  place: { id: string };
}

// Converters

const placeConverter = {
  toFirestore() {
    return {};
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot
  ): ModelPlace {
    const data = snapshot.data();
    return {
      name: data.name,
      parts: data.parts,
    };
  },
};

const inventoryConvertor = {
  toFirestore(inventory: ModelInventory): firebase.firestore.DocumentData {
    return {
      name: inventory.name,
      count: inventory.count,
      place: inventory.place,
    };
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot
  ): ModelInventory {
    const data = snapshot.data();
    return {
      name: data.name,
      count: data.count,
      place: { id: data.place?.id },
    };
  },
};

// DB calls

export async function getPlaces(): Promise<IPlace[]> {
  return await db
    .collection('places')
    .withConverter(placeConverter)
    .get()
    .then((response) => {
      return response.docs.map((place) => {
        return {
          id: place.id,
          name: place.data().name,
          parts: place.data().parts?.map(({ id }) => id),
        };
      });
    });
}

export async function getInventory(): Promise<IInventory[]> {
  // Because fields in documents are not typed and required in firestore I need to filter incoming data (that sucks)
  return await db
    .collection('inventory')
    .withConverter(inventoryConvertor)
    .get()
    .then((response) => {
      return response.docs
        .filter((inventory) => {
          const { name, count, place } = inventory.data();
          /* Someone posted inventory object like this with not exist placeId in known places('main', 'main-101', ...): 
            {
              id: "rc0FfsGmkd03FeHNd7pu",
              name: "Test",
              count: 1,
              placeId: "8kLxGNeVCBgVeErQzz5T" -> UNKNOWN placeId
            }
          */
          if (place && place.id && PLACES_IDS.includes(place.id)) {
            if (name && typeof name === 'string') {
              if (count && typeof count === 'number') {
                return true;
              }
            }
          }
        })
        .map((inventory) => {
          return {
            id: inventory.id,
            name: inventory.data().name,
            count: inventory.data().count,
            placeId: inventory.data().place.id,
          };
        });
    });
}

export async function postInventory(inventory: ModelInventory) {
  const { name, count, place } = inventory;

  if (!PLACES_IDS.includes(place.id)) {
    throw new Error('Такого места не существует!');
  }

  return await db
    .collection('inventory')
    .withConverter(inventoryConvertor)
    .add({
      name,
      count,
      place,
    })
    .then((docref) => docref.id);
}

export async function setInventory(
  InventoryId: string,
  fields: { name: string; count: number }
) {
  return await db
    .collection('inventory')
    .withConverter(inventoryConvertor)
    .doc(InventoryId)
    .update(fields);
}

export async function deleteInventory(InventoryId: string) {
  return await db
    .collection('inventory')
    .withConverter(inventoryConvertor)
    .doc(InventoryId)
    .delete();
}
