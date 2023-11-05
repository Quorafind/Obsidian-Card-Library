import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { queryService } from '@/services';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function countByKey(arr: Model.Card[], key: string): Map<string, number> {
  const counts = {};

  for (const item of arr) {
    const keyValue = item[key];
    if (!counts[keyValue]) {
      counts[keyValue] = 1;
    } else {
      counts[keyValue]++;
    }
  }

  const resultMap = new Map();
  for (const [k, v] of Object.entries(counts)) {
    resultMap.set(k, v);
  }

  return resultMap;
}

export function convertToMap(counts: { [key: string]: number }): Map<string, number> {
  const resultMap = new Map();
  for (const [k, v] of Object.entries(counts)) {
    resultMap.set(k, v);
  }

  return resultMap;
}

export function queryIsEmptyOrBlank(query: Query): boolean {
  const { tags, color, path, linked, type, text, filter: queryId } = query;
  const queryFilter = queryService.getQueryById(queryId);

  if (
    (tags && tags.length > 0) ||
    (color && color.length > 0) ||
    (type && type.length > 0) ||
    (linked && linked.length > 0) ||
    (path && path.length > 0) ||
    text ||
    queryFilter
  ) {
    return false;
  }

  return !queryFilter;
}

export function isMobileView(viewStatus: string): boolean {
  return viewStatus === 'md' || viewStatus === 'sm';
}
