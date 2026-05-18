import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import MultilingualLookupPopup from "@/components/MultilingualLookupPopup";
import {
  CMMN_CODE_I18N_KEYS,
  CMMN_CODE_I18N_FALLBACK,
  formatRowMessage,
  type CmmnCodeI18nText,
} from "./cmmnCodeI18n";

function CmmnCodeList(props) {
  console.group("CmmnCodeList");
  console.log("[Start] CmmnCodeList ------------------------------");
  console.log("CmmnCodeList [props] : ", props);

  const { langGb } = useLanguage();

  const { companyList, cmpnyCd, setCmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_CODE_I18N_KEYS, CMMN_CODE_I18N_FALLBACK, { cmpnyCd });

  // ③ 트리 구조 코드 목록
  const [codeTree, setCodeTree] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedTreeNode, setSelectedTreeNode] = useState(null);

  // ④ 코드 상세 정보
  const [codeDetail, setCodeDetail] = useState({
    upperCodeName: "",
    upperCode: "",
    bizCodeName: "",
    code: "",
    bizCodeCn: "",
    useFl: "Y",
    codeLangKey: "",
  });

  // ⑤ 코드 리스트
  const [codeDetailList, setCodeDetailList] = useState([]);
  const [selectedDetailRows, setSelectedDetailRows] = useState(new Set());

  // 추가 모드
  const [isAddMode, setIsAddMode] = useState(false);

  const [showMultilingualPopup, setShowMultilingualPopup] = useState(false);
  const multilingualResolveRef = useRef<((langKey: string, displayMessage: string, messageMap: Map<string, string>) => void) | null>(null);

  // 트리 2단계까지 자동 확장
  const expandTreeToLevel2 = useCallback((nodes, level = 0, expandedSet = new Set()) => {
    if (!nodes || nodes.length === 0) return expandedSet;

    nodes.forEach((node) => {
      const hasChildren = node.children && node.children.length > 0;

      // 0단계(최상위)와 1단계 노드는 자동 확장
      if (hasChildren && level < 2) {
        expandedSet.add(node.codeId);
        // 자식 노드도 재귀적으로 처리
        if (node.children && node.children.length > 0) {
          expandTreeToLevel2(node.children, level + 1, expandedSet);
        }
      }
    });

    return expandedSet;
  }, []);

  // ③ 코드 트리 조회 (회사코드 반영)
  const retrieveCodeTree = useCallback(() => {
    const langCodeParam = langGb || "ko_KR";
    const params = new URLSearchParams({ langGb: langCodeParam });
    if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
    const retrieveListURL = `/cmmnCode/tree?${params.toString()}`;
    console.log("트리 조회 URL:", retrieveListURL);
    console.log("사용할 언어코드:", langCodeParam);

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        console.log("트리 조회 응답 전체:", resp);
        console.log("트리 조회 응답.result:", resp.result);
        console.log("트리 조회 응답.resultCode:", resp.resultCode);

        let treeData = null;
        if (resp && resp.resultCode === 200 && resp.result) {
          treeData = resp.result;
          console.log("트리 데이터 설정:", resp.result);
        } else if (resp && resp.result) {
          // resultCode가 없어도 result가 있으면 사용
          treeData = resp.result;
          console.log("트리 데이터 설정 (resultCode 없음):", resp.result);
        } else {
          console.log("트리 데이터 없음 - 응답:", resp);
          setCodeTree([]);
          return;
        }

        // 트리 데이터 설정
        setCodeTree(treeData);

        // 2단계까지 자동 확장
        if (treeData && treeData.length > 0) {
          const expandedSet = expandTreeToLevel2(treeData);
          setExpandedNodes(expandedSet);
          console.log("2단계까지 자동 확장된 노드:", Array.from(expandedSet));
        }
      },
      function (resp) {
        console.log("트리 조회 에러:", resp);
        setCodeTree([]);
      }
    );
  }, [langGb, cmpnyCd, expandTreeToLevel2]);

  // ④ 코드 상세 조회 (회사코드 반영)
  const retrieveCodeDetail = useCallback(
    (codeId) => {
      if (!codeId) return;

      const params = new URLSearchParams({ codeId, langGb: langGb || "ko_KR" });
      if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
      const retrieveDetailURL = `/cmmnCode/detail?${params.toString()}`;
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      };

      EgovNet.requestFetch(
        retrieveDetailURL,
        requestOptions,
        (resp) => {
          if (resp.result) {
            setCodeDetail({
              upperCodeName: resp.result.upperCodeName || "",
              upperCode: resp.result.upperCodeId || "",
              bizCodeName: resp.result.codeName || "",
              code: resp.result.codeId || "",
              bizCodeCn: resp.result.codeCn || "",
              useFl: resp.result.useFl || "Y",
              codeLangKey: resp.result.codeLangKey || "",
            });
            setSelectedTreeNode({ codeId });
            setIsAddMode(false);

            // ⑤ 코드 리스트 조회
            retrieveCodeDetailList(codeId);
          }
        },
        function (resp) {
          console.log("err response : ", resp);
        }
      );
    },
    [langGb, cmpnyCd]
  );

  // ⑤ 코드 리스트 조회 (회사코드 반영)
  const retrieveCodeDetailList = useCallback(
    (codeId) => {
      const params = new URLSearchParams({ codeId, langGb: langGb || "ko_KR" });
      if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
      const retrieveListURL = `/cmmnCode/detailList?${params.toString()}`;
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      };

      EgovNet.requestFetch(
        retrieveListURL,
        requestOptions,
        (resp) => {
          if (resp.result) {
            setCodeDetailList(resp.result);
          } else {
            setCodeDetailList([]);
          }
        },
        function (resp) {
          console.log("err response : ", resp);
          setCodeDetailList([]);
        }
      );
    },
    [langGb, cmpnyCd]
  );

  // ⑥ 상위 코드 정보 조회 (추가 모드)
  const retrieveParentCode = useCallback(
    (codeId) => {
      // 현재 선택된 노드의 정보를 상위코드로 사용
      // 선택된 노드의 코드 → 상위코드로 복사
      // 선택된 노드의 업무코드명 → 상위코드명으로 복사
      setCodeDetail((prev) => {
        // 선택된 노드의 코드와 업무코드명을 상위코드/상위코드명으로 복사
        const upperCode = prev.code || codeId || "";
        const upperCodeName = prev.bizCodeName || "";

        return {
          upperCodeName: upperCodeName,
          upperCode: upperCode,
          bizCodeName: "",
          code: "",
          bizCodeCn: "",
          useFl: "Y",
          codeLangKey: "",
        };
      });
      setIsAddMode(true);
      setCodeDetailList([]);
      setSelectedDetailRows(new Set());
      setSelectedTreeNode(null);
    },
    []
  );

  // 트리 노드 토글
  const toggleNode = (codeId, event) => {
    if (event) {
      event.stopPropagation();
    }
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(codeId)) {
      newExpanded.delete(codeId);
    } else {
      newExpanded.add(codeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 트리 렌더링 (③) - 개선된 버전 (아이콘 및 연결선 포함)
  // 트리 렌더링 (③)
  const renderTreeNode = (node, level = 0, isLast = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.codeId);
    const isSelected = selectedTreeNode && selectedTreeNode.codeId === node.codeId;

    return (
      <div key={node.codeId} style={{ position: "relative" }}>
        {level > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: (level - 1) * 16 + 15,
                top: 0,
                ...(isLast ? { height: 16 } : { bottom: 0 }),
                width: 1,
                borderLeft: "1px solid #ddd",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: (level - 1) * 16 + 15,
                top: 16,
                width: 13,
                height: 1,
                borderTop: "1px solid #ddd",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </>
        )}
        {hasChildren && isExpanded && (
          <div
            style={{
              position: "absolute",
              left: level * 16 + 15,
              top: 16,
              height: 20,
              width: 1,
              borderLeft: "1px solid #ddd",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
        <div
          className={`tree-node${isSelected ? " tree-node--selected" : ""}${node.useFl === "N" ? " tree-node--disabled" : ""}`}
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8 }}
          onClick={() => {
            retrieveCodeDetail(node.codeId);
            if (hasChildren && !isExpanded) toggleNode(node.codeId, null);
          }}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleNode(node.codeId, e)} className="tree-toggle-wrap">
              <span className="tree-toggle-btn">{isExpanded ? "−" : "+"}</span>
            </span>
          ) : (
            <span style={{ display: "none" }} />
          )}
          {hasChildren ? (
            <i className={`icon-box ${isExpanded ? "icon-folder-open" : "icon-folder"}`} style={{ marginRight: 4 }} />
          ) : (
            <i className="ph ph-file menu-tree-file-icon" />
          )}
          <span className="tree-node-label">{node.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, index) =>
              renderTreeNode(child, level + 1, index === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // 최상위 코드 추가
  const handleAddTopLevel = () => {
    // 선택된 노드가 있으면 그 노드의 정보를 상위코드로 사용
    if (selectedTreeNode && codeDetail.code) {
      // 선택된 노드의 정보를 상위코드로 복사
      setCodeDetail({
        upperCodeName: codeDetail.bizCodeName || "",
        upperCode: codeDetail.code || "",
        bizCodeName: "",
        code: "",
        bizCodeCn: "",
        useFl: "Y",
        codeLangKey: "",
      });
    } else {
      // 선택된 노드가 없으면 최상위 코드 추가
      setCodeDetail({
        upperCodeName: "",
        upperCode: "#",
        bizCodeName: "",
        code: "",
        bizCodeCn: "",
        useFl: "Y",
        codeLangKey: "",
      });
    }
    setIsAddMode(true);
    setCodeDetailList([]);
    setSelectedDetailRows(new Set());
    // selectedTreeNode는 유지하지 않음
    setSelectedTreeNode(null);
  };

  // ⑥ 추가 버튼 클릭 (트리 노드)
  const handleAddSubCode = (codeId, event) => {
    if (event) {
      event.stopPropagation();
    }
    retrieveParentCode(codeId);
  };

  // 코드 리스트 행 추가 (⑨-a)
  const handleAddDetailRow = () => {
    const newRow = {
      codeName: "",
      detailCodeId: "",
      detailCodeValue: "",
      useFl: "Y",
      sortingSq: codeDetailList.length > 0
        ? Math.max(...codeDetailList.map(item => item.sortingSq || 0)) + 1
        : 1,
      codeLangKey: "",
    };
    setCodeDetailList([...codeDetailList, newRow]);
  };

  // 코드 리스트 행 삭제 (⑨-b)
  const handleDeleteDetailRows = () => {
    if (selectedDetailRows.size === 0) {
      alert(i18nText.msgSelectItemToDelete);
      return;
    }

    const newList = codeDetailList.filter(
      (item, index) => !selectedDetailRows.has(index)
    );
    // 순서 재정렬
    newList.forEach((item, index) => {
      item.sortingSq = index + 1;
    });
    setCodeDetailList(newList);
    setSelectedDetailRows(new Set());
  };

  // 코드 리스트 행 순서 변경 (⑨-c)
  const handleMoveDetailRow = (direction) => {
    if (selectedDetailRows.size !== 1) {
      alert(i18nText.msgSelectOneToMove);
      return;
    }

    const selectedIndex = Array.from(selectedDetailRows)[0] as number;
    const newList = [...codeDetailList];

    if (direction === "up" && selectedIndex > 0) {
      [newList[selectedIndex - 1], newList[selectedIndex]] = [
        newList[selectedIndex],
        newList[selectedIndex - 1],
      ];
      newList.forEach((item, index) => {
        item.sortingSq = index + 1;
      });
      setCodeDetailList(newList);
      setSelectedDetailRows(new Set([selectedIndex - 1]));
    } else if (direction === "down" && selectedIndex < newList.length - 1) {
      [newList[selectedIndex], newList[selectedIndex + 1]] = [
        newList[selectedIndex + 1],
        newList[selectedIndex],
      ];
      newList.forEach((item, index) => {
        item.sortingSq = index + 1;
      });
      setCodeDetailList(newList);
      setSelectedDetailRows(new Set([selectedIndex + 1]));
    }
  };

  // 코드 리스트 행 체크박스 토글
  const handleDetailRowCheck = (index) => {
    const newSelected = new Set(selectedDetailRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedDetailRows(newSelected);
  };

  // 코드리스트 헤더 체크박스: 전체 선택 / 전체 해제
  const handleDetailHeaderCheck = () => {
    if (codeDetailList.length === 0) return;
    const allSelected = selectedDetailRows.size === codeDetailList.length;
    if (allSelected) {
      setSelectedDetailRows(new Set());
    } else {
      setSelectedDetailRows(new Set(codeDetailList.map((_, i) => i)));
    }
  };

  // 코드 리스트 행 입력 변경
  const handleDetailRowChange = (index, field, value) => {
    const newList = [...codeDetailList];
    newList[index][field] = value;
    setCodeDetailList(newList);
  };

  const handleMultilingualLookup = (_field: unknown, _index: unknown, callback: (langKey: string, displayMessage: string, messageMap?: Map<string, string>) => void) => {
    multilingualResolveRef.current = callback as (langKey: string, displayMessage: string, messageMap: Map<string, string>) => void;
    setShowMultilingualPopup(true);
  };

  // ⑦ 저장 버튼 클릭
  const handleSave = () => {
    // 필수 입력 항목 검증: 상위 코드명, 상위코드, 업무코드명, 코드
    if (!codeDetail.upperCode || String(codeDetail.upperCode).trim() === "") {
      alert(i18nText.msgRequiredParentCode);
      return;
    }
    if (codeDetail.upperCode !== "#" && (!codeDetail.upperCodeName || String(codeDetail.upperCodeName).trim() === "")) {
      alert(i18nText.msgRequiredParentCodeName);
      return;
    }
    if (!codeDetail.bizCodeName || String(codeDetail.bizCodeName).trim() === "") {
      alert(i18nText.msgRequiredBizCodeName);
      return;
    }
    if (!codeDetail.code || String(codeDetail.code).trim() === "") {
      alert(i18nText.msgRequiredCode);
      return;
    }

    // 코드리스트 필수 입력 항목 검증: 코드명, 코드, 코드값
    if (codeDetailList && codeDetailList.length > 0) {
      for (let i = 0; i < codeDetailList.length; i++) {
        const item = codeDetailList[i];
        if (!item.codeName || String(item.codeName).trim() === "") {
          alert(formatRowMessage(i18nText.msgReqRowCodeName, i + 1));
          return;
        }
        if (!item.detailCodeId || String(item.detailCodeId).trim() === "") {
          alert(formatRowMessage(i18nText.msgReqRowCode, i + 1));
          return;
        }
        if (!item.detailCodeValue || String(item.detailCodeValue).trim() === "") {
          alert(formatRowMessage(i18nText.msgReqRowCodeValue, i + 1));
          return;
        }
        if (!item.useFl || (item.useFl !== "Y" && item.useFl !== "N")) {
          alert(formatRowMessage(i18nText.msgReqRowUseYn, i + 1));
          return;
        }
        if (!item.sortingSq || item.sortingSq <= 0) {
          alert(formatRowMessage(i18nText.msgReqRowSort, i + 1));
          return;
        }
      }
    }

    const saveURL = isAddMode ? "/cmmnCode" : `/cmmnCode/${codeDetail.code}`;
    const requestOptions = {
      method: isAddMode ? "POST" : "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        cmpnyCd: cmpnyCd || undefined,
        codeId: codeDetail.code,
        upperCodeId: codeDetail.upperCode,
        useFl: codeDetail.useFl,
        codeCn: codeDetail.bizCodeCn || "",
        codeName: codeDetail.bizCodeName,
        codeLangKey: codeDetail.codeLangKey,
        codeDetailList: codeDetailList,
      }),
    };

    EgovNet.requestFetch(
      saveURL,
      requestOptions,
      (resp) => {
        if (resp.resultCode === 200) {
          alert(isAddMode ? i18nText.msgCodeRegistered : i18nText.msgCodeUpdated);
          retrieveCodeTree(); // 트리 갱신
          if (isAddMode) {
            retrieveCodeDetail(codeDetail.code);
          } else {
            retrieveCodeDetail(selectedTreeNode.codeId);
          }
        } else {
          alert(resp.resultMessage || i18nText.msgErrorOnSave);
          // PK 중복 시 해당 입력란으로 포커스
          const focusInfo = resp.result;
          if (focusInfo && typeof focusInfo === "object" && focusInfo.duplicateKey) {
            setTimeout(() => {
              if (focusInfo.duplicateKey === "CODE_ID") {
                document.getElementById("codeDetail_codeId")?.focus();
              } else if (focusInfo.duplicateKey === "DETAIL_CODE_ID" && typeof focusInfo.duplicateDetailIndex === "number") {
                document.getElementById(`codeDetailList_${focusInfo.duplicateDetailIndex}_detailCodeId`)?.focus();
              }
            }, 100);
          }
        }
      },
      function (resp) {
        console.log("err response : ", resp);
        alert(i18nText.msgErrorOnSave);
      }
    );
  };

  // ⑧ 삭제 버튼 클릭
  const handleDelete = () => {
    if (!selectedTreeNode || !window.confirm(i18nText.msgConfirmDeleteCode)) {
      return;
    }

    // 하위 코드 존재 여부 확인 (회사코드 반영)
    const checkParams = new URLSearchParams({ codeId: selectedTreeNode.codeId });
    if (cmpnyCd) checkParams.set("cmpnyCd", cmpnyCd);
    const checkChildrenURL = `/cmmnCode/checkChildren?${checkParams.toString()}`;
    const checkChildrenOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      checkChildrenURL,
      checkChildrenOptions,
      (resp) => {
        if (resp.result && resp.result.ox === "X") {
          alert(i18nText.msgHasChildCode);
          return;
        }

        const deleteParams = new URLSearchParams();
        if (cmpnyCd) deleteParams.set("cmpnyCd", cmpnyCd);
        const deleteURL = `/cmmnCode/${selectedTreeNode.codeId}${deleteParams.toString() ? "?" + deleteParams.toString() : ""}`;
        const requestOptions = {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
        };

        EgovNet.requestFetch(
          deleteURL,
          requestOptions,
          (resp) => {
            if (resp.resultCode === 200) {
              alert(i18nText.msgCodeDeleted);
              setSelectedTreeNode(null);
              setCodeDetail({
                upperCodeName: "",
                upperCode: "",
                bizCodeName: "",
                code: "",
                bizCodeCn: "",
                useFl: "Y",
                codeLangKey: "",
              });
              setCodeDetailList([]);
              retrieveCodeTree(); // 트리 갱신
            } else {
              alert(resp.resultMessage || i18nText.msgErrorOnDelete);
            }
          },
          function (resp) {
            console.log("err response : ", resp);
            alert(i18nText.msgErrorOnDelete);
          }
        );
      },
      function (resp) {
        console.log("err response : ", resp);
        alert(i18nText.msgErrorCheckChild);
      }
    );
  };

  // 초기 로딩 및 언어/회사 변경 시
  useEffect(() => {
    const langCodeParam = langGb || "ko_KR";
    console.log("언어/회사 변경 감지, langGb:", langGb, "cmpnyCd:", cmpnyCd);
    retrieveCodeTree();
    if (selectedTreeNode) {
      retrieveCodeDetail(selectedTreeNode.codeId);
    }
  }, [langGb, cmpnyCd, retrieveCodeTree, retrieveCodeDetail]);

  const Location = React.memo(function Location({
    labels,
  }: {
    labels: CmmnCodeI18nText;
  }) {
    return (
      <div className="location">
        <h1 className="location__title">{labels.pageTitle}</h1>
        <ul>
          <li>
            <Link to={URL.MAIN} className="home">
              {labels.navHome}
            </Link>
          </li>
          <li>
            <Link to={URL.SYSTEM}>{labels.navSystem}</Link>
          </li>
          <li>{labels.pageTitle}</li>
        </ul>
      </div>
    );
  });

  console.log("------------------------------CmmnCodeList [End]");
  console.groupEnd();

  return (
    <div className="container">
      <div className="c_wrap">
        {/* <!-- Location --> */}
        <Location labels={i18nText} />
        {/* <!--// Location --> */}

        <div className="layout">
          <div className="contents contents--code-mgmt" id="contents">
            <div className="condition md-condition md-condition-plain-row">
              {/* 회사 선택 (맨 왼쪽) */}
              <div className="left-box">
                <label className="f_select" htmlFor="cmpnyCd">
                  <select
                    id="cmpnyCd"
                    value={String(cmpnyCd ?? "")}
                    onChange={(e) => {
                      syncCompanySession(e.target.value);
                    }}
                  >
                    {companyList.length === 0 ? (
                      <option value="">{i18nText.msgLoadingCompanyList}</option>
                    ) : (
                      companyList.map((c) => (
                        <option key={c.cmpnyCd} value={c.cmpnyCd}>{c.cmpnyNm}</option>
                      ))
                    )}
                  </select>
                </label>
              </div>
              {/* 상단 컨트롤: 추가/삭제/저장 버튼 */}
              <div className="right-box">
                {/* ⑥ 추가 버튼 */}
                <button
                  type="button"
                  className="pd-btn"
                  onClick={handleAddTopLevel}
                >
                  {i18nText.btnAdd}
                </button>

                {/* ⑧ 삭제 버튼 */}
                <button
                  type="button"
                  className="pd-btn"
                  onClick={handleDelete}
                  disabled={isAddMode || !selectedTreeNode}
                  style={{
                    opacity: (isAddMode || !selectedTreeNode) ? 0.5 : 1,
                    cursor: (isAddMode || !selectedTreeNode) ? "not-allowed" : "pointer",
                  }}
                >
                  {i18nText.btnDelete}
                </button>

                {/* ⑦ 저장 버튼 */}
                <button
                  type="button"
                  className="pd-btn primary"
                  onClick={handleSave}
                >
                  {i18nText.btnSave}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "0", alignItems: "stretch", minHeight: 0 }}>
              {/* 왼쪽: 코드 트리 (공통 md-form-card) */}
              <div
                className="md-form-card menu-tree-card"
              >
                <div className="menu-tree-scroll">
                  {codeTree && codeTree.length > 0 ? (
                    codeTree.map((node, index) =>
                      renderTreeNode(node, 0, index === codeTree.length - 1)
                    )
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                      {i18nText.msgNoData}
                    </div>
                  )}
                </div>
              </div>

              {/* <!-- 오른쪽: 코드정보(1개 박스) + 코드 리스트(별도 박스), 공통 md-form-card --> */}
              <div
                style={{
                  flex: "1",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  minHeight: 0,
                }}
              >
                {/* 코드정보 - 하나의 네모박스 (공통 md-form-card) */}
                <div className="md-form-card" style={{ flex: "0 0 auto", width: "100%", minWidth: 0 }}>
                  <h3 className="system-subtitle">{i18nText.titleCodeInfo}</h3>
                  <div className="board_view2 md-program-edit-form code-detail-form" style={{ width: "100%", minWidth: 0 }}>
                    <dl>
                      <dt>{i18nText.labelParentName} <span className="req">*</span></dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          readOnly
                          value={codeDetail.upperCodeName}
                          style={{ backgroundColor: "#f5f5f5" }}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelParentCode} <span className="req">*</span></dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={codeDetail.upperCode}
                          readOnly
                          style={{ backgroundColor: "#f5f5f5" }}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelBizName} <span className="req">*</span></dt>
                      <dd>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
                          <input
                            type="text"
                            className="f_input"
                            value={codeDetail.bizCodeName}
                            readOnly
                            placeholder={i18nText.placeholderSelectMultilingual}
                            style={{ flex: 1, minWidth: 0, backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                          />
                          {isAddMode && (
                            <button
                              className="btn btn_blue_h46"
                              onClick={() => handleMultilingualLookup("bizCodeName", null, (langKey, message) => {
                                setCodeDetail({ ...codeDetail, codeLangKey: langKey, bizCodeName: message || "" });
                              })}
                              style={{ padding: "0 15px", whiteSpace: "nowrap" }}
                            >
                              <span>{i18nText.btnSearch}</span>
                            </button>
                          )}
                        </div>
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelCode} <span className="req">*</span></dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={codeDetail.code}
                          onChange={(e) => {
                            if (isAddMode) {
                              setCodeDetail({ ...codeDetail, code: e.target.value });
                            }
                          }}
                          readOnly={!isAddMode}
                          style={{
                            backgroundColor: isAddMode ? "#fff" : "#f5f5f5",
                            cursor: isAddMode ? "text" : "not-allowed",
                          }}
                          maxLength={30}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelUseYn}</dt>
                      <dd>
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                            <input
                              type="radio"
                              name="useFl"
                              value="Y"
                              checked={codeDetail.useFl === "Y"}
                              onChange={(e) => setCodeDetail({ ...codeDetail, useFl: e.target.value })}
                            />
                            <span>{i18nText.etcUse}</span>
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                            <input
                              type="radio"
                              name="useFl"
                              value="N"
                              checked={codeDetail.useFl === "N"}
                              onChange={(e) => setCodeDetail({ ...codeDetail, useFl: e.target.value })}
                            />
                            <span>{i18nText.etcNotUse}</span>
                          </label>
                        </div>
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelBizDesc}</dt>
                      <dd>
                        <textarea
                          className="f_txtar w_full"
                          value={codeDetail.bizCodeCn || ""}
                          onChange={(e) =>
                            setCodeDetail({ ...codeDetail, bizCodeCn: e.target.value })
                          }
                          maxLength={1000}
                          onKeyPress={(e) => {
                            if (!/[\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
                              e.preventDefault();
                            }
                          }}
                          rows={5}
                        />
                      </dd>
                    </dl>
                  </div>
                </div>

                {/* 코드 리스트 - 별도 네모박스 (공통 md-form-card) */}
                <div className="md-form-card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }}>
                  <div className="section-title-row">
                    <h3 className="system-subtitle mb-0">{i18nText.titleCodeList}</h3>
                    {(isAddMode || selectedTreeNode) && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="pd-btn"
                          onClick={handleAddDetailRow}
                        >
                          {i18nText.btnAdd}
                        </button>
                        <button
                          className="pd-btn"
                          onClick={handleDeleteDetailRows}
                        >
                          {i18nText.btnDelete}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="board_list md-code-detail-list board_list--flat" style={{ width: "100%", minWidth: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                    <div className="head" style={{ display: "flex", width: "100%", flexWrap: "nowrap", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ flex: "0 0 50px", width: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <input
                          type="checkbox"
                          checked={codeDetailList.length > 0 && selectedDetailRows.size === codeDetailList.length}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = codeDetailList.length > 0 && selectedDetailRows.size > 0 && selectedDetailRows.size < codeDetailList.length;
                            }
                          }}
                          onChange={handleDetailHeaderCheck}
                          title={selectedDetailRows.size === codeDetailList.length ? i18nText.etcDeselectAll : i18nText.etcSelectAll}
                        />
                      </div>
                      <span style={{ flex: "1 1 0", minWidth: 0 }}>{i18nText.labelCodeName} <span className="req">*</span></span>
                      <span style={{ flex: "0 0 150px", width: "150px" }}>{i18nText.labelCode} <span className="req">*</span></span>
                      <span style={{ flex: "0 0 150px", width: "150px" }}>{i18nText.labelCodeValue} <span className="req">*</span></span>
                      <span style={{ flex: "0 0 100px", width: "100px" }}>{i18nText.labelUseYn}</span>
                      <span style={{ flex: "0 0 100px", width: "100px" }}>{i18nText.labelSortOrder}</span>
                    </div>
                    <div className="result" style={{ minHeight: "200px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                      {codeDetailList.length > 0 ? (
                        codeDetailList.map((item, index) => (
                          <div key={index} className="list_item" style={{ display: "flex", width: "100%", flexWrap: "nowrap" }}>
                            <div style={{ flex: "0 0 50px", width: "50px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={selectedDetailRows.has(index)}
                                onChange={() => handleDetailRowCheck(index)}
                              />
                            </div>
                            <div style={{ flex: "1 1 0", minWidth: 0, padding: "0 15px" }} className="al">
                              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                <input
                                  type="hidden"
                                  value={item.codeLangKey || ""}
                                />
                                <input
                                  type="text"
                                  className="f_input"
                                  value={item.codeName || ""}
                                  readOnly
                                  placeholder={i18nText.placeholderSelectMultilingual}
                                  style={{ flex: 1, backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                                />
                                <button
                                  className="btn btn_blue_h46 btn-magnifier btn-magnifier--code"
                                  onClick={() => handleMultilingualLookup("codeName", index, (langKey, displayMessage, messageMap) => {
                                    handleDetailRowChange(index, "codeLangKey", langKey);
                                    handleDetailRowChange(index, "codeName", displayMessage);
                                  })}
                                  title={i18nText.btnSearch}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div style={{ flex: "0 0 150px", width: "150px", padding: "0 15px" }} className="al">
                              <input
                                id={`codeDetailList_${index}_detailCodeId`}
                                type="text"
                                className="f_input w_full"
                                value={item.detailCodeId || ""}
                                onChange={(e) =>
                                  handleDetailRowChange(index, "detailCodeId", e.target.value)
                                }
                              />
                            </div>
                            <div style={{ flex: "0 0 150px", width: "150px", padding: "0 15px" }} className="al">
                              <input
                                type="text"
                                className="f_input w_full"
                                value={item.detailCodeValue || ""}
                                onChange={(e) =>
                                  handleDetailRowChange(index, "detailCodeValue", e.target.value)
                                }
                              />
                            </div>
                            <div style={{ flex: "0 0 100px", width: "100px", textAlign: "center" }}>
                              <select
                                className="f_select"
                                title={i18nText.labelUseYn}
                                style={{ width: "80px" }}
                                value={item.useFl || "Y"}
                                onChange={(e) =>
                                  handleDetailRowChange(index, "useFl", e.target.value)
                                }

                              >
                                <option value="Y">{i18nText.etcY}</option>
                                <option value="N">{i18nText.etcN}</option>
                              </select>
                            </div>
                            <div style={{ flex: "0 0 100px", width: "100px", textAlign: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                                <span>{item.sortingSq || index + 1}</span>
                                <button
                                  className="btn btn_blue_h46 btn-magnifier"
                                  onClick={() => {
                                    setSelectedDetailRows(new Set([index]));
                                    handleMoveDetailRow("up");
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 16,
                                    height: 16,
                                    minWidth: 16,
                                    minHeight: 16,
                                  }}
                                  disabled={index === 0}
                                  title={i18nText.etcMoveUp}
                                >
                                  <span style={{ fontSize: "6px", lineHeight: 1 }}>▲</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no_data" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
                          {i18nText.msgNoData}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--// 본문 --> */}
          </div>
        </div>
      </div>

      <MultilingualLookupPopup
        open={showMultilingualPopup}
        onClose={() => {
          setShowMultilingualPopup(false);
          multilingualResolveRef.current = null;
        }}
        cmpnyCd={cmpnyCd || ""}
        langCode={langGb || "ko_KR"}
        onSelect={(langKey, displayMessage, messageMap) => {
          multilingualResolveRef.current?.(langKey, displayMessage, messageMap);
          multilingualResolveRef.current = null;
        }}
      />
    </div>
  );
}

export default CmmnCodeList;
