import { useMemo } from 'react';

export const usePagination = (data = [], page = 1, pageSize = 10) => {
  return useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);
};
