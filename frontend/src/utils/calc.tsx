export const itemIdxByPage = (resultCnt: number, currentPageNo: number, pageSize: number, index: number): number => resultCnt + 1 - ((currentPageNo - 1) * pageSize + index + 1);

