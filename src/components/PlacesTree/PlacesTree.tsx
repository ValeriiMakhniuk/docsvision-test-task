import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { setActivePlaceId } from '../../redux/slices/placesSlice';

import { TreeView, TreeItem } from '@material-ui/lab';
import Icon from '@material-ui/core/Icon';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { List as ListPrloader } from 'react-content-loader';

import { IPlace, IInventory } from '../../interfaces';

interface PlaceTreeProps {
  places: Record<string, IPlace>;
  inventory: Record<string, IInventory[]>;
}

interface PlaceNode {
  id: string;
  name: string;
  parts: string[];
}

const getPartsInventoryAmount = (
  places: Record<string, IPlace>,
  inventory: Record<string, IInventory[]>
) => (parts: string[] | undefined): number => {
  if (!parts) {
    return 0;
  }

  const iter = (partId: string, amount: number): number => {
    const partPlace: IPlace = places[partId];
    const inventoryAmount = inventory[partPlace.id]
      ? inventory[partPlace.id].length + amount
      : 0;

    if (!partPlace.parts) {
      return inventoryAmount;
    }

    return partPlace.parts.reduce(
      (sum, partPlacePartId) => iter(partPlacePartId, sum),
      inventoryAmount
    );
  };

  return parts
    .map((partId) => iter(partId, 0))
    .reduce((sum, amount) => sum + amount, 0);
};

export const PlacesTree: React.FC<PlaceTreeProps> = ({ places, inventory }) => {
  const dispath = useDispatch();

  const { isLoading, error: placesError } = useSelector(
    (state: RootState) => state.places
  );

  const renderedNodes: string[] = [];

  const renderNode = (node: IPlace) => {
    const { id, name, parts } = node;

    if (renderedNodes.includes(id)) {
      return null;
    }

    const currentNodeInventoryAmount = inventory[id] ? inventory[id].length : 0;
    const totalInventoryAmount =
      getPartsInventoryAmount(places, inventory)(parts) +
      currentNodeInventoryAmount;

    renderedNodes.push(id);

    return (
      <TreeItem
        key={id}
        // nodeId={uuidv4()}
        nodeId={id}
        label={
          totalInventoryAmount > 0 ? (
            <>
              {name}: <b>{totalInventoryAmount}</b>
            </>
          ) : (
            name
          )
        }
      >
        {parts &&
          parts.map((placeId) => {
            return renderNode(places[placeId]);
          })}
      </TreeItem>
    );
  };

  if (isLoading) {
    return <ListPrloader viewBox='0 0 400 110' width='100%' height='100%' />;
  }

  const rootNodes = Object.values(places).filter(
    ({ parts }) => parts !== undefined
  );

  const handleNodeSelect = (e: React.ChangeEvent<{}>, nodeId: string) => {
    dispath(setActivePlaceId(nodeId));
  };

  return (
    <TreeView
      defaultExpandIcon={<ChevronRightIcon />}
      defaultCollapseIcon={<ExpandMoreIcon />}
      onNodeSelect={handleNodeSelect}
    >
      {rootNodes &&
        rootNodes.map((place) => {
          return renderNode(place);
        })}
    </TreeView>
  );
};
