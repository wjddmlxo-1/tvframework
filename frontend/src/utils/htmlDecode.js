/**
 * HTML 엔티티를 디코딩하는 함수
 * @param {string} html - HTML 엔티티가 포함된 문자열
 * @returns {string} 디코딩된 문자열
 */
export const decodeHtmlEntities = (html) => {
  if (!html || typeof html !== 'string') {
    return html;
  }
  
  // textarea 요소를 사용하여 HTML 엔티티 디코딩
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};


