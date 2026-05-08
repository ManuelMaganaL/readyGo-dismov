import { useMemo } from 'react';
import type { Activity } from '@/types';
import { timeToMinutes } from '@/utils/date';

export type PositionedActivity = Activity & {
  _startMin: number;
  _endMin: number;
  _col: number;
  _colSpan: number;
};

export function usePositionedActivities(activities: Activity[]) {
  return useMemo(() => {
    const normalized = activities
      .filter((activity) => Boolean(activity.time_start) && Boolean(activity.time_end))
      .map((activity) => {
        const start = timeToMinutes(activity.time_start!);
        const end = timeToMinutes(activity.time_end!);
        return {
          ...activity,
          _startMin: start,
          _endMin: Math.max(end, start + 15),
          _col: 0,
          _colSpan: 1,
        } as PositionedActivity;
      })
      .sort((a, b) => a._startMin - b._startMin || a._endMin - b._endMin);

    let cluster: PositionedActivity[] = [];
    let clusterMaxEnd = -Infinity;

    const flushCluster = () => {
      if (cluster.length === 0) return;

      const colEnd: number[] = [];
      for (const item of cluster) {
        let placedCol = -1;
        for (let colIndex = 0; colIndex < colEnd.length; colIndex += 1) {
          if (colEnd[colIndex] <= item._startMin) {
            placedCol = colIndex;
            break;
          }
        }
        if (placedCol === -1) {
          placedCol = colEnd.length;
          colEnd.push(item._endMin);
        } else {
          colEnd[placedCol] = item._endMin;
        }
        item._col = placedCol;
      }

      const totalCols = Math.max(1, colEnd.length);
      cluster.forEach((item) => {
        item._colSpan = totalCols;
      });

      cluster = [];
      clusterMaxEnd = -Infinity;
    };

    for (const item of normalized) {
      if (cluster.length === 0) {
        cluster.push(item);
        clusterMaxEnd = item._endMin;
        continue;
      }

      if (item._startMin < clusterMaxEnd) {
        cluster.push(item);
        clusterMaxEnd = Math.max(clusterMaxEnd, item._endMin);
      } else {
        flushCluster();
        cluster.push(item);
        clusterMaxEnd = item._endMin;
      }
    }
    flushCluster();

    return normalized;
  }, [activities]);
}
