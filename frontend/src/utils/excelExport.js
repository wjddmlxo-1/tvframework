import * as XLSX from 'xlsx';

/**
 * 테이블 데이터를 엑셀 파일로 다운로드
 * @param {Array} headers - 헤더 배열 (예: ['번호', '구분', '언어 Key', '한국어', '영어'])
 * @param {Array} data - 데이터 배열 (각 항목은 배열 형태, 예: [[1, 'A', 'key1', '값1', 'value1'], ...])
 * @param {String} filename - 파일명 (기본값: 'export.xlsx')
 */
export const exportToExcel = (headers, data, filename = 'export.xlsx') => {
  // 헤더와 데이터를 결합
  const worksheetData = [headers, ...data];
  
  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // 컬럼 너비 자동 조정 (선택사항)
  const columnWidths = headers.map((header, index) => {
    // 각 컬럼의 최대 길이 계산
    const maxLength = Math.max(
      header ? header.toString().length : 10,
      ...data.map(row => row[index] ? row[index].toString().length : 0)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }; // 최소 10, 최대 50
  });
  worksheet['!cols'] = columnWidths;
  
  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // 파일 다운로드
  XLSX.writeFile(workbook, filename);
};

