import { useCallback, useEffect, useState } from "react";

import Column from "./Column";
import { BOARD_COLUMNS } from "./constant";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

import { type ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/dist/types/adapter/element-adapter";
import type { CardData, ColumnData } from "./global";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";


const Board = () => {
  const [columnsData, setColumnsData] = useState(BOARD_COLUMNS);

  const moveCard = useCallback(({ 
    movedCardIndexInSourceColumn, sourceColumnId, destinationColumnId, movedCardIndexInDestinationColumn }: { 
      movedCardIndexInSourceColumn: number; 
      sourceColumnId: string; 
      destinationColumnId: string, 
      movedCardIndexInDestinationColumn?: number 
    }) => {
    const sourceColumnData = columnsData[sourceColumnId];
    const destinationColumnData = columnsData[destinationColumnId];
    
    const cardToMove = sourceColumnData.cards[movedCardIndexInSourceColumn];

    const newSourceColumnData = {
      ...sourceColumnData,
      cards: sourceColumnData.cards.filter((cards) => cards.id !== cardToMove.id)
    };

    const newDestinationCards = Array.from(destinationColumnData.cards);

    if (movedCardIndexInDestinationColumn !== undefined) {
      newDestinationCards.splice(movedCardIndexInDestinationColumn, 0, cardToMove);
    }
    else {
      newDestinationCards.push(cardToMove);
    }
    const newFinishColumnData = {
      ...destinationColumnData,
      cards: newDestinationCards
    };
    setColumnsData({
      ...columnsData,
      [sourceColumnId]: newSourceColumnData,
      [destinationColumnId]: newFinishColumnData
    });
  }, [columnsData, setColumnsData]);

  const reorderCard = useCallback(
    ({ columnId, startIndex, finishIndex }: { columnId: string; startIndex: number; finishIndex: number }) => {
      console.log(startIndex);
      console.log(finishIndex);
      if (startIndex === finishIndex) {
        return;
      }
      const sourceColumnData = columnsData[columnId];

      const updatedItems = reorder({
        list: sourceColumnData.cards,
        startIndex,
        finishIndex
      });

      const updatedSourceColumn = {
        ...sourceColumnData,
        cards: updatedItems
      };

      setColumnsData({
        ...columnsData,
        [columnId]: updatedSourceColumn
      });
    }, [columnsData, setColumnsData]);

  const handleDrop = useCallback(({ source, location }: ElementEventBasePayload) => {

    const destination: number = location.current.dropTargets?.length;
    if (!destination) {
      return;
    }

    if (source.data.type === "card") {
      const draggedCardId = source.data.id;

      const [, sourceColumnRecord] = location.initial.dropTargets;
      const sourceColumnId = (sourceColumnRecord.data as ColumnData).columnId;

      const sourceColumnData = columnsData[sourceColumnId];
      const draggedCardIndex = sourceColumnData.cards.findIndex((card: CardData) => card.id === draggedCardId);
      const [destinationColumnRecord] = location.current.dropTargets;

              const closestEdgeOfTarget = extractClosestEdge(destinationColumnRecord.data);
        console.log(closestEdgeOfTarget);

      if (location.current.dropTargets.length === 1) {
        const destinationColumnId = (destinationColumnRecord.data as ColumnData).columnId;
        if (sourceColumnId === destinationColumnId) {
          const destinationIndex = getReorderDestinationIndex({
            startIndex: draggedCardIndex,
            indexOfTarget: sourceColumnData.cards.length - 1,
            closestEdgeOfTarget: null,
            axis: "vertical"
          });

          reorderCard({
            columnId: sourceColumnData.columnId,
            startIndex: draggedCardIndex,
            finishIndex: destinationIndex
          });
          return;
        }
        moveCard({
          movedCardIndexInSourceColumn: draggedCardIndex,
          sourceColumnId,
          destinationColumnId
        });
      }

      if (location.current.dropTargets.length === 2) {
        const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets;
        const destinationColumnId = (destinationColumnRecord.data as ColumnData).columnId;

        const destinationColumn = columnsData[destinationColumnId];

        const indexOfTarget = destinationColumn.cards.findIndex(
          (card) => card.id === destinationCardRecord.data.id);
        
        const closestEdgeOfTarget = extractClosestEdge(destinationCardRecord.data);

        if (sourceColumnId === destinationColumnId) {
          const destinationIndex = getReorderDestinationIndex({
            startIndex: draggedCardIndex,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: "vertical"
          });

          reorderCard({
            columnId: sourceColumnId, 
            startIndex: draggedCardIndex,
            finishIndex: destinationIndex
          });
          return;
        }

        const destinationIndex = closestEdgeOfTarget === "bottom" ? indexOfTarget + 1 : indexOfTarget;
        moveCard({
          movedCardIndexInSourceColumn: draggedCardIndex,
          sourceColumnId,
          movedCardIndexInDestinationColumn: destinationIndex,
          destinationColumnId
        });
      }

    }

  }, [columnsData]);

  useEffect(() => {
    return monitorForElements({
      onDrop: handleDrop
    });
  }, [handleDrop]);
  return (
    <div className="board">
      {(Object.keys(columnsData) as Array<keyof typeof columnsData>).map((columnId) => {
        return (
          <Column key={columnId} columnData={columnsData[columnId]} />
        );
      })}
    </div>
  );
};

export default Board;