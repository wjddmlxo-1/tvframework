import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_COMPONENT_I18N_FALLBACK, CMMN_COMPONENT_I18N_KEYS } from "@/components/cmmnComponentI18n";

/**
 * @typedef {{ currentPageNo:number; pageSize:number; totalRecordCount:number; recordCountPerPage:number }} PagingInfo
 * @typedef {{ pagination?: PagingInfo; moveToPage:(page:number)=>void }} PagingProps
 */

/** @param {PagingProps} props */
function Paging(props) {
  const i18nText = useCmmnScreenI18n(CMMN_COMPONENT_I18N_KEYS, CMMN_COMPONENT_I18N_FALLBACK);
  console.groupCollapsed("Paging");
  console.log("Paging [props] : ", props);

  /** @type {import("react").ReactNode[]} */
  let paginationTag = [];

  if (props.pagination === undefined) {
    paginationTag = [<li key="no-data">-</li>];
  } else {
    const currentPageNo = props.pagination.currentPageNo;
    const pageSize = props.pagination.pageSize;
    const totalRecordCount = props.pagination.totalRecordCount;
    const recordCountPerPage = props.pagination.recordCountPerPage;

    const totalPageCount = Math.ceil(totalRecordCount / recordCountPerPage);
    const currentFirstPage =
      Math.floor((currentPageNo - 1) / pageSize) * pageSize + 1;
    let currentLastPage = currentFirstPage + pageSize - 1;
    currentLastPage =
      currentLastPage > totalPageCount ? totalPageCount : currentLastPage;

    if (totalPageCount > pageSize) {
      // 첫 페이지 이동
      const firstPageTag = (
        <li key="fp" className="btn">
          <button
            onClick={() => {
              /** @type {(page:number)=>void} */ (props.moveToPage)(1);
            }}
            className="first"
          >
            {i18nText.btnFirst}
          </button>
        </li>
      );
      paginationTag.push(firstPageTag);

      // 이전 페이지 이동
      const prevPageIndex = currentPageNo - 1 > 0 ? currentPageNo - 1 : 1;
      const previousPageTag = (
        <li key="pp" className="btn">
          <button
            onClick={() => {
              /** @type {(page:number)=>void} */ (props.moveToPage)(prevPageIndex);
            }}
            className="prev"
          >
            {i18nText.btnPrev}
          </button>
        </li>
      );
      paginationTag.push(previousPageTag);
    }

    for (let i = currentFirstPage; i <= currentLastPage; i++) {
      if (i === currentPageNo) {
        // 현재 페이지
        const currentPage = (
          <li key={i}>
            <button className="cur">{i}</button>
          </li>
        );
        paginationTag.push(currentPage);
      } else {
        // 다른 페이지
        const otherPage = (
          <li key={i}>
            <button
              onClick={() => {
                /** @type {(page:number)=>void} */ (props.moveToPage)(i);
              }}
            >
              {i}
            </button>
          </li>
        );
        paginationTag.push(otherPage);
      }
    }
    if (totalPageCount > pageSize) {
      // 다음 페이지 이동 (한 페이지씩 이동)
      const nextPageIndex =
        currentPageNo + 1 <= totalPageCount
          ? currentPageNo + 1
          : totalPageCount;
      const nextPageTag = (
        <li key="np" className="btn">
          <button
            onClick={() => {
              /** @type {(page:number)=>void} */ (props.moveToPage)(nextPageIndex);
            }}
            className="next"
          >
            {i18nText.btnNext}
          </button>
        </li>
      );
      paginationTag.push(nextPageTag);

      // 마지막 페이지 이동
      const lastPageTag = (
        <li key="lp" className="btn">
          <button
            onClick={() => {
              /** @type {(page:number)=>void} */ (props.moveToPage)(totalPageCount);
            }}
            className="last"
          ></button>
        </li>
      );
      paginationTag.push(lastPageTag);
    }
  }
  console.log("paginationTag", paginationTag);
  console.groupEnd();

  return (
    <div className="paging">
      <ul>{paginationTag}</ul>
    </div>
  );
}

export default Paging;
