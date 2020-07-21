import React from 'react';
import MaterialTable, { Column } from 'material-table';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import {
  setInventory,
  postInventory,
  deleteInventory,
} from '../../redux/slices/inventorySlice';

import { cloneDeep } from 'lodash';

import { IInventory, IPlace } from '../../interfaces';
import { ModelInventory } from '../../services/firestore';

const getInventoryDataByPlaceId = (
  placeId: string,
  places: Record<string, IPlace>,
  inventory: Record<string, IInventory[]>
) => {
  const iter = (
    innerPlaceId: string,
    inventoryList: IInventory[]
  ): IInventory[] => {
    const haveParts = places[innerPlaceId].parts ? true : false;

    if (!haveParts) {
      return inventory[innerPlaceId]
        ? [...inventoryList, ...inventory[innerPlaceId].map(cloneDeep)]
        : [...inventoryList.map(cloneDeep)];
    }

    const parts = places[innerPlaceId].parts;

    const innerPlaceInventory = inventory[innerPlaceId]
      ? [...inventory[innerPlaceId].map(cloneDeep)]
      : [];

    return [
      ...inventoryList.map(cloneDeep),
      ...parts?.reduce((acc, partId) => iter(partId, acc), innerPlaceInventory),
    ];
  };

  return iter(placeId, []);
};

interface InventoryTableProps {
  places: Record<string, IPlace>;
  inventory: Record<string, IInventory[]>;
  activePlaceId: string;
}

export const InventoryTabel: React.FC<InventoryTableProps> = ({
  places,
  inventory,
  activePlaceId,
}) => {
  /* 
    Because material-table mutate entities and firestore return document.data() with preventExtensions
    I have to deepClone
  */
  const dispath = useDispatch();
  const placeName = useSelector((state: RootState) => {
    return state.places.placeById[activePlaceId].name;
  });

  const columns: Column<IInventory>[] = [
    {
      title: 'Инвентарь',
      field: 'name',
      validate: (rowData) => rowData.name !== '',
    },
    {
      title: 'Кол-во',
      field: 'count',
      type: 'numeric',
      validate: (rowData) => rowData.count > 0,
    },
  ];

  const data = getInventoryDataByPlaceId(activePlaceId, places, inventory);

  return (
    <MaterialTable
      title={placeName}
      columns={columns}
      data={data}
      style={{
        maxWidth: '1000px',
        width: '800px',
        minHeight: '400px',
      }}
      editable={{
        onRowUpdate(newData, oldData) {
          return new Promise((res) => {
            if (oldData) {
              dispath(setInventory(oldData.placeId, oldData.id, newData));
              res();
            }
          });
        },
        onRowAdd(newData) {
          return new Promise((res) => {
            const { name, count } = newData;
            const postData: ModelInventory = {
              name,
              count,
              place: { id: activePlaceId },
            };
            res();
            dispath(postInventory(postData));
          });
        },
        onRowDelete(oldData) {
          return new Promise((res) => {
            if (oldData) {
              dispath(deleteInventory(oldData.placeId, oldData.id));
              res();
            }
          });
        },
      }}
    />
  );
};
