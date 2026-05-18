import React, { useState, useEffect, useCallback, useRef, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as EgovNet from "@/api/egovFetch";
import { uploadProfileFile } from "@/api/bbsUserPostFileUpload";
import { fetchDeptTree, buildDeptHierarchy, expandDeptTreeToLevel2, type DeptTreeItem, type DeptTreeHierarchyNode } from "@/api/deptTree";
import URL from "@/constants/url";
import { SERVER_URL } from "@/config";
import { getLanguageCodeForApi } from "@/utils/language";
import { useLanguage } from "@/contexts/LanguageContext";
import MultilingualLookupPopup from "@/components/MultilingualLookupPopup";
import DeptSearchPopup from "@/components/DeptSearchPopup";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_USER_I18N_KEYS, CMMN_USER_I18N_FALLBACK, replaceI18nPlaceholders, type CmmnUserI18nText } from "./cmmnUserI18n";
type UserListItem = { mbrshSq: number; userId: string; userNm: string; deptNm: string; ofcpsNm?: string };
type CodeOption = { langSectionCode: string; langSectionName: string };
type DeptUserItem = { mbrshSq: number | string; userId: string; userNm: string; deptNm: string };

const API = "/cmmnUserManage";

/** 검색 버튼용 돋보기 아이콘 (어두운 배경 + 흰색 돋보기) */
function SearchIconButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="search-icon-btn"
      aria-label={title}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  );
}

/** CM_USER 컬럼 길이 제한 */
const MAX_USER = {
  USER_ID: 20,
  USER_NM: 60,
  USER_ENG_NM: 100,
  PASSWORD: 100,
  BRTHDY: 20,
  PASSWORD_HINT: 10,
  PASSWORD_CNSR: 100,
  NATION_CD: 2,
  ZIP_CD: 20,
  ADRES_ONE: 200,
  ADRES_TWO: 200,
  CITY_NM: 100,
  STATE_NM: 100,
  HOUSE_TELNO: 20,
  MBTLNUM: 20,
  FXNUM: 20,
  EMAIL_ADRES: 50,
} as const;

/** CM_USER_ORGNZT_MBRSH 컬럼 길이 제한 */
const MAX_MBRSH = {
  EMPL_NO: 20,
  OFFM_TELNO: 20,
  EMAIL_ADRES: 50,
  OFCPS_CD: 60,
  ECNY_YMD: 8,
  RETIRE_YMD: 8,
  DEPT_CD: 20,
} as const;

const PROFILE_MAX_MB = 10;

function truncate(s: string | undefined, max: number): string | undefined {
  if (s == null) return undefined;
  const t = s.trim();
  return t === "" ? undefined : t.slice(0, max);
}

function UserList() {
  const navigate = useNavigate();
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);

  const [activeTab, setActiveTab] = useState<"user" | "dept">("user");
  const { companyList: companyOptions, cmpnyCd: companyCode, onCompanyChange: syncCompanySession } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_USER_I18N_KEYS, CMMN_USER_I18N_FALLBACK, { cmpnyCd: companyCode || null });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [paginationInfo, setPaginationInfo] = useState({
    currentPageNo: 1,
    recordCountPerPage: 500,
    pageSize: 10,
    totalRecordCount: 0,
  });

  const [isNewUser, setIsNewUser] = useState(true);
  const [selectedMbrshSq, setSelectedMbrshSq] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userBasic, setUserBasic] = useState<Record<string, string>>({});
  const [companyInfo, setCompanyInfo] = useState<Record<string, string>>({});
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [duplicateCheckOutcome, setDuplicateCheckOutcome] = useState<null | "ok" | "fail">(null);
  const [passwordHintOptions, setPasswordHintOptions] = useState<CodeOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<CodeOption[]>([]);
  const [ofcpsOptions, setOfcpsOptions] = useState<CodeOption[]>([]);

  const [deptTree, setDeptTree] = useState<DeptTreeItem[]>([]);
  const [deptExpandedNodes, setDeptExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedDeptCd, setSelectedDeptCd] = useState("");
  const [deptDetail, setDeptDetail] = useState<Record<string, string> | null>(null);
  /** 초기화 후 신규 부서 입력 모드 (부서 코드 포커스·전체 편집 가능) */
  const [isDeptNewEntryMode, setIsDeptNewEntryMode] = useState(false);
  const deptCdInputRef = useRef<HTMLInputElement>(null);
  const [deptUserList, setDeptUserList] = useState<DeptUserItem[]>([]);
  const [companyUserListForDept, setCompanyUserListForDept] = useState<UserListItem[]>([]);
  /** API·JSON에 따라 mbrshSq가 number|string일 수 있어 문자열로 통일해 선택 상태 일치 */
  const [selectedDeptUserMbrshSq, setSelectedDeptUserMbrshSq] = useState<Set<string>>(new Set());
  const [selectedCompanyUserMbrshSq, setSelectedCompanyUserMbrshSq] = useState<Set<number>>(new Set());
  const [deptGradOptions, setDeptGradOptions] = useState<CodeOption[]>([]);
  const [deptSearchKeyword, setDeptSearchKeyword] = useState("");
  const [companyUserSearchKeywordForDept, setCompanyUserSearchKeywordForDept] = useState("");

  const [showDeptPopup, setShowDeptPopup] = useState(false);
  const [showDeptMultilingualPopup, setShowDeptMultilingualPopup] = useState(false);
  const [showUserSearchPopup, setShowUserSearchPopup] = useState(false);
  const [onSelectDeptCallback, setOnSelectDeptCallback] = useState<((deptCd: string, deptNm: string) => void) | null>(null);
  const [onSelectUserCallback, setOnSelectUserCallback] = useState<((mbrshSq: number, userId: string, userNm: string) => void) | null>(null);

  /** CM_USER.FILE_SQ — `/bbs/main/profile/file` (업로드는 게시글 첨부와 동일 API) */
  const [profileFileSq, setProfileFileSq] = useState("");
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileImgFailed, setProfileImgFailed] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const loadUserList = useCallback(() => {
    if (!companyCode) {
      setUserList([]);
      return;
    }
    const pageIndex = paginationInfo.currentPageNo;
    const recordCountPerPage = paginationInfo.recordCountPerPage;
    const offset = (pageIndex - 1) * recordCountPerPage;
    const params = new URLSearchParams();
    params.set("companyCode", companyCode);
    params.set("langCode", langCode);
    params.set("pageIndex", String(pageIndex));
    params.set("recordCountPerPage", String(recordCountPerPage));
    if (searchKeyword.trim()) params.set("searchKeyword", searchKeyword.trim());
    EgovNet.requestFetch(
      `${API}/companyUserList?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result) {
          setUserList(resp.result.list || []);
          if (resp.result.paginationInfo) {
            setPaginationInfo((prev) => ({
              ...prev,
              ...resp.result.paginationInfo,
            }));
          }
        }
      },
      () => setUserList([])
    );
  }, [companyCode, searchKeyword, langCode, paginationInfo.currentPageNo, paginationInfo.recordCountPerPage]);

  useEffect(() => {
    if (activeTab === "user" && companyCode) loadUserList();
  }, [activeTab, companyCode, loadUserList]);

  const loadCodeOptions = useCallback(() => {
    if (!companyCode) return;
    ["CMMNCODE.530", "CMMNCODE.570", "CMMNCODE.560"].forEach((codeId, idx) => {
      EgovNet.requestFetch(
        `${API}/codeOption?codeId=${encodeURIComponent(codeId)}&companyCode=${encodeURIComponent(companyCode)}&langCode=${encodeURIComponent(langCode)}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.result && Array.isArray(resp.result)) {
            if (codeId === "CMMNCODE.530") setPasswordHintOptions(resp.result);
            else if (codeId === "CMMNCODE.570") setGenderOptions(resp.result);
            else if (codeId === "CMMNCODE.560") setOfcpsOptions(resp.result);
          }
        }
      );
    });
  }, [companyCode, langCode]);

  useEffect(() => {
    if (companyCode) loadCodeOptions();
  }, [companyCode, loadCodeOptions]);

  const loadUserDetail = useCallback(
    (userId: string) => {
      if (!userId || !companyCode) return;
      EgovNet.requestFetch(
        `${API}/userDetail?userId=${encodeURIComponent(userId)}&companyCode=${encodeURIComponent(companyCode)}&langCode=${encodeURIComponent(langCode)}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.resultCode !== 200 && resp?.resultCode != null) {
            return;
          }
          const u = resp?.result?.user ?? {};
          const c = resp?.result?.companyInfo ?? {};
          const pfs = u.profileFileSq != null && String(u.profileFileSq).trim() !== "" ? String(u.profileFileSq).trim() : "";
          setProfileFileSq(pfs);
          setProfileImgFailed(false);
          setUserBasic({
            userId: u.userId ?? "",
            userNm: u.userNm ?? "",
            userEngNm: u.userEngNm ?? "",
            genderCd: u.genderCd ?? "",
            brthdy: u.brthdy ?? "",
            zipCd: u.zipCd ?? "",
            adresOne: u.adresOne ?? "",
            adresTwo: u.adresTwo ?? "",
            cityNm: u.cityNm ?? "",
            stateNm: u.stateNm ?? "",
            nationCd: u.nationCd ?? "",
            houseTelno: u.houseTelno ?? "",
            mbtlnum: u.mbtlnum ?? "",
            fxnum: u.fxnum ?? "",
            emailAdres: u.emailAdres ?? "",
            passwordHint: u.passwordHint ?? "",
            passwordCnsr: u.passwordCnsr ?? "",
            password: "",
          });
          setCompanyInfo({
            emplNo: c.emplNo ?? "",
            offmTelno: c.offmTelno ?? "",
            emailAdres: c.emailAdres ?? "",
            ofcpsCd: c.ofcpsCd ?? "",
            ecnyYmd: c.ecnyYmd ?? "",
            retireYmd: c.retireYmd ?? "99991230",
            deptCd: c.deptCd ?? "",
            deptNm: c.deptNm ?? "",
          });
          setPasswordConfirm("");
          setDuplicateCheckOutcome(null);
          setIsNewUser(false);
        }
      );
    },
    [companyCode, langCode]
  );

  const handleInitUserForm = () => {
    setIsNewUser(true);
    setSelectedUserId("");
    setSelectedMbrshSq(null);
    setUserBasic({
      userId: "",
      userNm: "",
      userEngNm: "",
      genderCd: "",
      brthdy: "",
      zipCd: "",
      adresOne: "",
      adresTwo: "",
      cityNm: "",
      stateNm: "",
      nationCd: "",
      houseTelno: "",
      mbtlnum: "",
      fxnum: "",
      passwordHint: "",
      passwordCnsr: "",
      password: "",
    });
    setCompanyInfo({
      emplNo: "",
      offmTelno: "",
      emailAdres: "",
      ofcpsCd: "",
      ecnyYmd: "",
      retireYmd: "99991230",
      deptCd: "",
      deptNm: "",
    });
    setPasswordConfirm("");
    setDuplicateCheckOutcome(null);
    setProfileFileSq("");
    setProfileImgFailed(false);
  };

  const handleSelectUser = (item: UserListItem) => {
    setSelectedMbrshSq(item.mbrshSq);
    setSelectedUserId(item.userId);
    loadUserDetail(item.userId);
  };

  const checkDuplicateUserId = () => {
    const id = (userBasic.userId || "").trim();
    if (!id) {
      alert(i18nText.msgEnterUserId);
      return;
    }
    EgovNet.requestFetch(
      `${API}/checkDuplicateUserId?userId=${encodeURIComponent(id)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        setDuplicateCheckOutcome(resp?.result === "O" ? "ok" : "fail");
      }
    );
  };

  const profileImageHref =
    profileFileSq.trim() !== ""
      ? `${SERVER_URL}/bbs/main/profile/file?fileSq=${encodeURIComponent(profileFileSq.trim())}`
      : null;

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = input.files;
    if (!files?.length || profileUploading) return;
    const f = files[0];
    /* 같은 파일 재선택 허용 — FileList 는 라이브라 value 를 먼저 비우면 length 가 0 이 되어 무응답이 됨 */
    input.value = "";
    if (!f.type.startsWith("image/")) {
      alert(i18nText.msgOnlyImageAllowed);
      return;
    }
    if (f.size > PROFILE_MAX_MB * 1024 * 1024) {
      alert(replaceI18nPlaceholders(i18nText.msgFileSizeLimit, { filesize: String(PROFILE_MAX_MB) }));
      return;
    }
    setProfileUploading(true);
    uploadProfileFile(
      f,
      (row) => {
        setProfileUploading(false);
        setProfileFileSq(String(row.fileSq).trim());
        setProfileImgFailed(false);
      },
      (msg) => {
        setProfileUploading(false);
        alert(msg ?? i18nText.msgImageUploadFailed);
      }
    );
  };

  const handleSaveUser = () => {
    const id = (userBasic.userId || "").trim();
    if (!id) {
      alert(i18nText.msgEnterUserId);
      return;
    }
    if (isNewUser) {
      if (duplicateCheckOutcome !== "ok") {
        alert(i18nText.msgRequireDuplicateCheck);
        return;
      }
      if (!(userBasic.password || "").trim()) {
        alert(i18nText.msgEnterPassword);
        return;
      }
      if (userBasic.password !== passwordConfirm) {
        alert(i18nText.msgPasswordMismatch);
        return;
      }
    }
    if (!(userBasic.userNm || "").trim()) {
      alert(i18nText.msgEnterUserName);
      return;
    }
    if (!(userBasic.userEngNm ?? "").trim()) {
      alert(i18nText.msgEnterUserEngName);
      return;
    }
    if (!(companyInfo.deptCd ?? "").trim()) {
      alert(i18nText.msgSelectDeptInCompany);
      return;
    }
    const brthdyVal = (userBasic.brthdy ?? "").replace(/-/g, "").slice(0, MAX_USER.BRTHDY);
    const userBasicTruncated: Record<string, string> = {
      userId: (userBasic.userId ?? "").trim().slice(0, MAX_USER.USER_ID),
      userNm: (truncate(userBasic.userNm, MAX_USER.USER_NM) ?? ""),
      userEngNm: (truncate(userBasic.userEngNm, MAX_USER.USER_ENG_NM) ?? ""),
      genderCd: (userBasic.genderCd ?? "").slice(0, 1),
      brthdy: brthdyVal ?? "",
      adresOne: truncate(userBasic.adresOne, MAX_USER.ADRES_ONE) ?? "",
      adresTwo: truncate(userBasic.adresTwo, MAX_USER.ADRES_TWO) ?? "",
      cityNm: truncate(userBasic.cityNm, MAX_USER.CITY_NM) ?? "",
      stateNm: truncate(userBasic.stateNm, MAX_USER.STATE_NM) ?? "",
      nationCd: truncate(userBasic.nationCd, MAX_USER.NATION_CD) ?? "",
      zipCd: truncate(userBasic.zipCd, MAX_USER.ZIP_CD) ?? "",
      houseTelno: truncate(userBasic.houseTelno, MAX_USER.HOUSE_TELNO) ?? "",
      mbtlnum: truncate(userBasic.mbtlnum, MAX_USER.MBTLNUM) ?? "",
      fxnum: truncate(userBasic.fxnum, MAX_USER.FXNUM) ?? "",
      emailAdres: truncate(userBasic.emailAdres, MAX_USER.EMAIL_ADRES) ?? "",
      passwordHint: truncate(userBasic.passwordHint, MAX_USER.PASSWORD_HINT) ?? "",
      passwordCnsr: truncate(userBasic.passwordCnsr, MAX_USER.PASSWORD_CNSR) ?? "",
      profileFileSq: profileFileSq.trim(),
    };
    if (userBasic.password != null && (userBasic.password as string).trim() !== "") {
      userBasicTruncated.password = (userBasic.password as string).trim().slice(0, MAX_USER.PASSWORD);
    }
    const ecnyYmd = (companyInfo.ecnyYmd ?? "").replace(/-/g, "").slice(0, MAX_MBRSH.ECNY_YMD);
    const retireYmd = (companyInfo.retireYmd ?? "").replace(/-/g, "").slice(0, MAX_MBRSH.RETIRE_YMD);
    const companyInfoTruncated: Record<string, string> = {
      deptCd: (companyInfo.deptCd ?? "").slice(0, MAX_MBRSH.DEPT_CD),
      deptNm: companyInfo.deptNm ?? "",
      emplNo: truncate(companyInfo.emplNo, MAX_MBRSH.EMPL_NO) ?? "",
      offmTelno: truncate(companyInfo.offmTelno, MAX_MBRSH.OFFM_TELNO) ?? "",
      emailAdres: truncate(companyInfo.emailAdres, MAX_MBRSH.EMAIL_ADRES) ?? "",
      ofcpsCd: (companyInfo.ofcpsCd ?? "").slice(0, MAX_MBRSH.OFCPS_CD),
      ecnyYmd: ecnyYmd ?? "",
      retireYmd: retireYmd ?? "",
    };
    const body: Record<string, unknown> = {
      companyCode,
      userBasic: userBasicTruncated,
      companyInfo: companyInfoTruncated,
      creationId: "admin",
      updateId: "admin",
    };
    if (!isNewUser) {
      body.userId = id;
      EgovNet.requestFetch(
        `${API}/userDetail`,
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgSaved);
            loadUserList();
          } else alert(resp?.resultMessage || i18nText.msgSaveFailShort);
        },
        () => alert(i18nText.msgErrorOnSave)
      );
    } else {
      EgovNet.requestFetch(
        `${API}/userRegistration`,
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgRegistered);
            handleInitUserForm();
            loadUserList();
          } else alert(resp?.resultMessage || i18nText.msgRegisterFailShort);
        },
        () => alert(i18nText.msgErrorOnRegister)
      );
    }
  };

  const handleDeleteUser = () => {
    if (!selectedMbrshSq || !selectedUserId) {
      alert(i18nText.msgSelectUserToDelete);
      return;
    }
    if (!confirm(i18nText.msgConfirmDeleteUser)) return;
    EgovNet.requestFetch(
      `${API}/companyUser?companyCode=${encodeURIComponent(companyCode)}&mbrshSq=${selectedMbrshSq}&userId=${encodeURIComponent(selectedUserId)}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgDeleted);
          handleInitUserForm();
          loadUserList();
        } else alert(resp?.resultMessage || i18nText.msgDeleteFailShort);
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const handleDeleteSelectedUsers = () => {
    if (selectedUserIds.size === 0) {
      alert(i18nText.msgSelectItemToDelete);
      return;
    }
    if (!confirm(i18nText.msgConfirmDeleteUser)) return;
    const arr = Array.from(selectedUserIds);
    const itemMap = new Map(userList.map((u) => [String(u.mbrshSq), u]));
    let finished = 0;
    let ok = 0;
    arr.forEach((mbrshSq) => {
      const item = itemMap.get(String(mbrshSq));
      if (!item) {
        finished++;
        if (finished === arr.length) {
          setSelectedUserIds(new Set());
          loadUserList();
          if (ok < arr.length) {
            alert(
              ok === 0 ? i18nText.msgDeleteFailed : replaceI18nPlaceholders(i18nText.msgPartialDeleted, { count: ok, total: arr.length })
            );
          }
        }
        return;
      }
      EgovNet.requestFetch(
        `${API}/companyUser?companyCode=${encodeURIComponent(companyCode)}&mbrshSq=${encodeURIComponent(String(item.mbrshSq))}&userId=${encodeURIComponent(item.userId)}`,
        { method: "DELETE", headers: { "Content-type": "application/json" } },
        (resp) => {
          finished++;
          if (Number(resp?.resultCode) === 200) ok++;
          if (finished === arr.length) {
            setSelectedUserIds(new Set());
            handleInitUserForm();
            loadUserList();
            if (ok < arr.length) {
              alert(
                ok === 0 ? i18nText.msgDeleteFailedCheck : replaceI18nPlaceholders(i18nText.msgPartialDeleted, { count: ok, total: arr.length })
              );
            } else {
              alert(i18nText.msgDeleted);
            }
          }
        },
        () => {
          finished++;
          if (finished === arr.length) {
            setSelectedUserIds(new Set());
            loadUserList();
            alert(
              ok === 0 ? i18nText.msgDeleteFailedCheck : replaceI18nPlaceholders(i18nText.msgPartialDeleted, { count: ok, total: arr.length })
            );
          }
        }
      );
    });
  };

  const openDeptSearch = (callback: (deptCd: string, deptNm: string) => void) => {
    setOnSelectDeptCallback(() => callback);
    setShowDeptPopup(true);
  };

  const loadDeptTree = useCallback(() => {
    if (!companyCode) return;
    fetchDeptTree(
      companyCode,
      langCode,
      (list) => {
        setDeptTree(list);
        setDeptExpandedNodes(expandDeptTreeToLevel2(list));
      },
      () => { setDeptTree([]); setDeptExpandedNodes(new Set()); }
    );
  }, [companyCode, langCode]);

  useEffect(() => {
    if (activeTab === "dept" && companyCode) {
      loadDeptTree();
      loadCompanyUserListForDept("");
      if (deptGradOptions.length === 0) {
        EgovNet.requestFetch(
          `${API}/codeOption?codeId=CMMNCODE.571&companyCode=${encodeURIComponent(companyCode)}&langCode=${encodeURIComponent(langCode)}`,
          { method: "GET", headers: { "Content-type": "application/json" } },
          (r) => {
            if (r?.result && Array.isArray(r.result)) setDeptGradOptions(r.result);
          }
        );
      }
    }
  }, [activeTab, companyCode, loadDeptTree]);

  const loadDeptDetail = useCallback(
    (deptCd: string) => {
      if (!companyCode || !deptCd) return;
      EgovNet.requestFetch(
        `${API}/deptDetail?companyCode=${encodeURIComponent(companyCode)}&deptCd=${encodeURIComponent(deptCd)}&langCode=${encodeURIComponent(langCode)}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.result) {
            const d = resp.result;
            setDeptDetail({
              deptCd: d.deptCd ?? "",
              deptNmKey: d.deptNmKey ?? "",
              deptNm: d.deptNm ?? "",
              upperDeptCd: d.upperDeptCd ?? "",
              upperDeptNm: d.upperDeptNm ?? "",
              deptGradCd: d.deptGradCd ?? "",
              dprlrMbrshSq: d.dprlrId ?? "",
              dprlrId: d.dprlrId ?? "",
              dprlrNm: d.dprlrNm ?? "",
              exprtnYmd: d.exprtnYmd ?? "99991230",
              useFl: d.useFl ?? "Y",
              sortOrd: d.sortOrd ?? "",
            });
          } else setDeptDetail(null);
        }
      );
    },
    [companyCode, langCode]
  );

  const handleDeptInit = () => {
    if (!companyCode) {
      alert(i18nText.msgSelectCompanyReq);
      return;
    }
    setIsDeptNewEntryMode(true);
    setSelectedDeptCd("");
    setDeptUserList([]);
    setSelectedDeptUserMbrshSq(new Set());
    setDeptDetail({
      deptCd: "",
      deptNmKey: "",
      deptNm: "",
      upperDeptCd: "#",
      upperDeptNm: "",
      deptGradCd: "",
      dprlrMbrshSq: "",
      dprlrUserId: "",
      dprlrNm: "",
      exprtnYmd: "99991230",
      useFl: "Y",
      sortOrd: "",
    });
    requestAnimationFrame(() => {
      setTimeout(() => deptCdInputRef.current?.focus(), 0);
    });
  };

  const handleSaveDept = () => {
    if (!companyCode || !deptDetail) {
      alert(i18nText.msgSelectCompanyAndDept);
      return;
    }
    const upperDeptCd = (deptDetail.upperDeptCd ?? "").trim();
    const upperDeptNm = (deptDetail.upperDeptNm ?? "").trim();
    if (!upperDeptCd) {
      alert(i18nText.msgSelectParentDeptCode);
      return;
    }
    if (!upperDeptNm) {
      alert(i18nText.msgSelectParentDeptName);
      return;
    }
    if (isDeptNewEntryMode) {
      const deptCd = (deptDetail.deptCd ?? "").trim();
      if (!deptCd) {
        alert(i18nText.msgEnterDeptCode);
        deptCdInputRef.current?.focus();
        return;
      }
      const deptNmKey = (deptDetail.deptNmKey ?? "").trim();
      if (!deptNmKey) {
        alert(i18nText.msgSelectDeptNameMulti);
        return;
      }
      const exprtn = (deptDetail.exprtnYmd ?? "").replace(/-/g, "").slice(0, 8);
      const body = {
        companyCode,
        deptCd,
        deptNmKey,
        upperDeptCd,
        deptGradCd: (deptDetail.deptGradCd ?? "").trim(),
        dprlrId: (deptDetail.dprlrMbrshSq ?? deptDetail.dprlrId ?? "").trim(),
        exprtnYmd: exprtn.length === 8 ? exprtn : "99991230",
        useFl: deptDetail.useFl ?? "Y",
        sortOrd: (deptDetail.sortOrd ?? "").trim() || "0",
        creationId: "admin",
      };
      EgovNet.requestFetch(
        `${API}/dept`,
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgRegistered);
            setIsDeptNewEntryMode(false);
            setSelectedDeptCd(deptCd);
            loadDeptDetail(deptCd);
            loadDeptTree();
          } else alert(resp?.resultMessage || i18nText.msgRegisterFailShort);
        },
        () => alert(i18nText.msgErrorOnRegister)
      );
      return;
    }
    if (!selectedDeptCd) {
      alert(i18nText.msgSaveAfterSelectDept);
      return;
    }
    const exprtn = (deptDetail.exprtnYmd ?? "").replace(/-/g, "").slice(0, 8);
    const bodyPut = {
      companyCode,
      deptCd: selectedDeptCd,
      deptNmKey: deptDetail.deptNmKey ?? "",
      upperDeptCd: deptDetail.upperDeptCd ?? "",
      deptGradCd: deptDetail.deptGradCd ?? "",
      dprlrId: (deptDetail.dprlrMbrshSq ?? "").trim(),
      exprtnYmd: exprtn.length === 8 ? exprtn : "99991230",
      useFl: deptDetail.useFl ?? "Y",
      sortOrd: deptDetail.sortOrd ?? "",
      updateId: "admin",
    };
    EgovNet.requestFetch(
      `${API}/dept`,
      { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(bodyPut) },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgSaved);
          loadDeptDetail(selectedDeptCd);
          loadDeptTree();
        } else alert(resp?.resultMessage || i18nText.msgSaveFailShort);
      },
      () => alert(i18nText.msgErrorOnSave)
    );
  };

  const handleDeleteDept = () => {
    if (!companyCode) {
      alert(i18nText.msgSelectCompanyReq);
      return;
    }
    if (isDeptNewEntryMode) {
      alert(i18nText.msgNoDeleteDuringNew);
      return;
    }
    if (!selectedDeptCd || selectedDeptCd === "#") {
      alert(i18nText.msgSelectDeptToDelete);
      return;
    }
    if (!confirm(`${i18nText.msgConfirmDeleteDept}\n- ${i18nText.msgCannotDeleteDeptWithChildren}`)) return;

    const params = new URLSearchParams();
    params.set("companyCode", companyCode);
    params.set("deptCd", selectedDeptCd);
    params.set("updateId", "admin");

    EgovNet.requestFetch(
      `${API}/deptDelete?${params.toString()}`,
      { method: "POST", headers: { "Content-type": "application/json" }, body: "{}" },
      (resp) => {
        if (Number(resp?.resultCode) === 200) {
          alert(i18nText.msgDeleted);
          handleDeptInit();
          loadDeptTree();
        } else {
          alert(resp?.resultMessage || i18nText.msgDeleteFailShort);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const deptTreeHierarchy = buildDeptHierarchy(deptTree);

  const toggleDeptNode = (deptCd: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeptExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(deptCd)) next.delete(deptCd);
      else next.add(deptCd);
      return next;
    });
  };

  const renderDeptTreeNodeForTab = (node: DeptTreeHierarchyNode, level: number, isLast: boolean) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = deptExpandedNodes.has(node.deptCd);
    const isSelected = selectedDeptCd === node.deptCd;

    return (
      <div key={node.deptCd} style={{ position: "relative" }}>
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
          className={`tree-node${isSelected ? " tree-node--selected" : ""}`}
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8 }}
          onClick={() => {
            setIsDeptNewEntryMode(false);
            setSelectedDeptCd(node.deptCd);
            loadDeptDetail(node.deptCd);
            if (hasChildren && !isExpanded) toggleDeptNode(node.deptCd);
          }}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleDeptNode(node.deptCd, e)} className="tree-toggle-wrap">
              <span className="tree-toggle-btn">{isExpanded ? "−" : "+"}</span>
            </span>
          ) : (
            <span style={{ display: "none" }} />
          )}
          {hasChildren ? (
            <i className={`icon-box ${isExpanded ? "icon-folder-open" : "icon-folder"}`} />
          ) : (
            <i className="ph ph-file menu-tree-file-icon" />
          )}
          <span className="tree-node-label">{node.deptNm || node.deptCd}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, index) => renderDeptTreeNodeForTab(child, level + 1, index === node.children!.length - 1))}
          </div>
        )}
      </div>
    );
  };

  const loadDeptUserList = useCallback(() => {
    if (!companyCode || !selectedDeptCd) {
      setDeptUserList([]);
      return;
    }
    const params = new URLSearchParams();
    params.set("companyCode", companyCode);
    params.set("deptCd", selectedDeptCd);
    params.set("langCode", langCode);
    if (deptSearchKeyword.trim()) params.set("searchKeyword", deptSearchKeyword.trim());
    EgovNet.requestFetch(
      `${API}/deptUserList?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        setDeptUserList(resp?.result && Array.isArray(resp.result) ? resp.result : []);
      },
      () => setDeptUserList([])
    );
  }, [companyCode, selectedDeptCd, langCode, deptSearchKeyword]);

  const loadCompanyUserListForDept = useCallback((overrideKeyword?: string): void => {
    if (!companyCode) {
      setCompanyUserListForDept([]);
      return;
    }
    const params = new URLSearchParams();
    params.set("companyCode", companyCode);
    params.set("langCode", langCode);
    params.set("pageIndex", "1");
    params.set("recordCountPerPage", "500");
    const keyword = overrideKeyword !== undefined ? overrideKeyword : companyUserSearchKeywordForDept;
    if (keyword.trim()) params.set("searchKeyword", keyword.trim());
    EgovNet.requestFetch(
      `${API}/companyUserList?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        setCompanyUserListForDept(resp?.result?.list && Array.isArray(resp.result.list) ? resp.result.list : []);
      },
      () => setCompanyUserListForDept([])
    );
  }, [companyCode, langCode, companyUserSearchKeywordForDept]);

  const handleAddUsersToDept = () => {
    if (!selectedDeptCd || selectedCompanyUserMbrshSq.size === 0) {
      alert(selectedDeptCd ? i18nText.msgSelectUserToAdd : i18nText.msgSelectDeptFirst);
      return;
    }
    const deptNm = deptDetail?.deptNm ?? "";
    const toAdd = companyUserListForDept.filter((u) => selectedCompanyUserMbrshSq.has(u.mbrshSq));
    let done = 0;
    toAdd.forEach((u) => {
      EgovNet.requestFetch(
        `${API}/deptUser`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            companyCode,
            userId: u.userId,
            mbrshSq: u.mbrshSq,
            companyInfo: { deptCd: selectedDeptCd, deptNm },
            creationId: "admin",
            updateId: "admin",
          }),
        },
        (resp) => {
          if (resp?.resultCode === 200) done++;
          if (done === toAdd.length) {
            setSelectedCompanyUserMbrshSq(new Set());
            loadDeptUserList();
            loadCompanyUserListForDept();
          }
        }
      );
    });
  };

  const handleRemoveUsersFromDept = () => {
    if (selectedDeptUserMbrshSq.size === 0) {
      alert(i18nText.msgSelectUserToRemove);
      return;
    }
    const arr = Array.from(selectedDeptUserMbrshSq);
    let finished = 0;
    let ok = 0;
    arr.forEach((mbrshSq) => {
      const sq = encodeURIComponent(String(mbrshSq));
      EgovNet.requestFetch(
        `${API}/deptUserDelete?mbrshSq=${sq}&updateId=admin`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: "{}",
        },
        (resp) => {
          finished++;
          if (Number(resp?.resultCode) === 200) ok++;
          if (finished === arr.length) {
            setSelectedDeptUserMbrshSq(new Set());
            loadDeptUserList();
            loadCompanyUserListForDept();
            if (ok < arr.length) {
              alert(
                ok === 0 ? i18nText.msgRemoveUserFailed : replaceI18nPlaceholders(i18nText.msgPartialRemoved, { count: ok, total: arr.length })
              );
            }
          }
        },
        () => {
          finished++;
          if (finished === arr.length) {
            setSelectedDeptUserMbrshSq(new Set());
            loadDeptUserList();
            loadCompanyUserListForDept();
            if (ok < arr.length) {
              alert(
                ok === 0 ? i18nText.msgRemoveUserFailed : replaceI18nPlaceholders(i18nText.msgPartialRemoved, { count: ok, total: arr.length })
              );
            }
          }
        }
      );
    });
  };

  useEffect(() => {
    loadDeptUserList();
  }, [loadDeptUserList]);

  const formatYmd = (s: string) => {
    if (!s || s.length !== 8) return s;
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  };
  const toYmd = (s: string) => (s || "").replace(/-/g, "").slice(0, 8);

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.pageTitle}</h1>
          <ul>
            <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
            <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
            <li>{i18nText.pageTitle}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents contents--user">
            <div className="au-tab-header">
              <button
                type="button"
                className={`au-tab${activeTab === "user" ? " active" : ""}`}
                onClick={() => setActiveTab("user")}
              >
                {i18nText.titleTabUser}
              </button>
              <button
                type="button"
                className={`au-tab${activeTab === "dept" ? " active" : ""}`}
                onClick={() => setActiveTab("dept")}
              >
                {i18nText.titleTabDept}
              </button>
              <div className="au-tab-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ minWidth: "180px" }}>
                  <label className="f_select" htmlFor="cmpnyCd">
                    <select
                      id="cmpnyCd"
                      value={String(companyCode ?? "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        syncCompanySession(v);
                        if (activeTab === "user") handleInitUserForm();
                        if (activeTab === "dept") { setSelectedDeptCd(""); setDeptDetail(null); }
                      }}
                    >
                      <option value="">{i18nText.etcSelect}</option>
                      {companyOptions.map((c) => (
                        <option key={c.cmpnyCd} value={c.cmpnyCd}>{c.cmpnyNm}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <Link to={URL.SYSTEM_COMPANY} className="btn btn_blue_h46 btn-slim">
                  <span>{i18nText.btnMoveCompanyInfo}</span>
                </Link>
              </div>
            </div>

            {activeTab === "user" && (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 560px) 1fr", gridTemplateRows: "30px auto", gap: "16px", width: "100%", minHeight: "400px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", height: "100%", boxSizing: "border-box", flexWrap: "nowrap", width: "360px" }}>
                  <input
                    type="text"
                    className="f_input"
                    placeholder={i18nText.placeholderSearchUserIdName}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && loadUserList()}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <button type="button" className="btn btn_default_h46 btn-slim author-role-searchbar__btn" onClick={loadUserList}>{i18nText.btnSearch}</button>
                  <button type="button" className="btn btn_default_h46 btn-slim author-role-searchbar__btn" onClick={handleDeleteSelectedUsers}>{i18nText.btnDelete}</button>
                </div>
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button type="button" className="btn btn_default_h46 btn-slim author-role-searchbar__btn" onClick={handleInitUserForm}>{i18nText.btnReset}</button>
                    <button type="button" className="btn btn_default_h46 btn-slim author-role-searchbar__btn" onClick={handleDeleteUser} disabled={isNewUser || !selectedUserId}>{i18nText.btnDelete}</button>
                    <button type="button" className="btn btn_blue_h46 btn-slim author-role-searchbar__btn" onClick={handleSaveUser}>{i18nText.btnSave}</button>
                  </div>
                </div>
                <div style={{ position: "relative", minHeight: 0, width: "100%", alignSelf: "stretch" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    <div className="board_list BRD006 md-admin-list" style={{ flex: "0 0 auto", marginTop: 0, minHeight: 0, border: "1px solid var(--md-outline, #dde2e5)", borderRadius: "var(--md-radius-md, 8px)", overflow: "hidden", boxSizing: "border-box" }}>
                      <div className="head head--compact">
                        <span className="md-col-chk">
                          <input
                            type="checkbox"
                            checked={userList.length > 0 && selectedUserIds.size === userList.length}
                            onChange={() => { if (selectedUserIds.size === userList.length) setSelectedUserIds(new Set()); else setSelectedUserIds(new Set(userList.map((u) => u.mbrshSq))); }}
                            aria-label={i18nText.etcAllSelect}
                          />
                        </span>
                        <span className="md-col-no">{i18nText.labelNo}</span>
                        <span>{i18nText.labelUserId}</span>
                        <span>{i18nText.labelUserName}</span>
                        <span>{i18nText.labelDeptName}</span>
                      </div>
                      <div className="result">
                        {!companyCode ? (
                          <p className="no_data">{i18nText.msgSelectCompany}</p>
                        ) : userList.length === 0 ? (
                          <p className="no_data">{i18nText.msgNoSearchResult}</p>
                        ) : (
                          userList.map((item, idx) => (
                            <div
                              key={item.mbrshSq}
                              className={`list_item ${selectedMbrshSq === item.mbrshSq ? "selected" : ""}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleSelectUser(item)}
                              onKeyDown={(e) => e.key === "Enter" && handleSelectUser(item)}
                            >
                              <div className="md-col-chk" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.has(item.mbrshSq)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setSelectedUserIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(item.mbrshSq)) next.delete(item.mbrshSq);
                                      else next.add(item.mbrshSq);
                                      return next;
                                    });
                                  }}
                                  aria-label={`${item.userNm}${i18nText.ariaSelectSuffix}`}
                                />
                              </div>
                              <div className="md-col-no">{userList.length - idx}</div>
                              <div>{item.userId}</div>
                              <div>{item.userNm}</div>
                              <div>{item.deptNm ?? ""}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0, alignSelf: "start", width: "100%" }}>
                  <div className="md-form-card" style={{ marginBottom: 0, padding: "20px 22px" }}>
                    <div className="author-embed-panel__title">{i18nText.titleUserBasicInfo}</div>
                    <div className="board_view2 md-program-edit-form" style={{ width: "100%", boxSizing: "border-box" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", alignItems: "start" }}>
                        <input ref={profileFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileFileChange} />
                        {/* 1행: 사용자ID | 프로필 사진 — 아래 사용자명·사용자영문명과 동일 그리드 셀(배경·테두리 없음) */}
                        <dl>
                          <dt>
                            {i18nText.labelUserId} <span className="req">*</span>
                          </dt>
                          <dd style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <input
                              type="text"
                              className="f_input w_full"
                              style={{ flex: "1 1 auto", maxWidth: "100%" }}
                              value={userBasic.userId ?? ""}
                              onChange={(e) => {
                                setUserBasic((u) => ({ ...u, userId: e.target.value }));
                                setDuplicateCheckOutcome(null);
                              }}
                              readOnly={!isNewUser}
                              maxLength={MAX_USER.USER_ID}
                            />
                            {isNewUser && (
                              <button
                                type="button"
                                className="btn user-basic__id-btn"
                                onClick={checkDuplicateUserId}
                              >
                                {i18nText.btnCheckDuplicate}
                              </button>
                            )}
                          </dd>
                        </dl>
                        <dl>
                          <dt>{i18nText.labelProfileImage}</dt>
                          <dd style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                            <div
                              className="user-profile-avatar"
                              aria-hidden
                            >
                              {profileImageHref && !profileImgFailed ? (
                                <img
                                  src={profileImageHref}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={() => setProfileImgFailed(true)}
                                />
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6, minWidth: 0 }}>
                              <button
                                type="button"
                                className="btn btn_default_h35"
                                style={{ flexShrink: 0, alignSelf: "flex-start" }}
                                disabled={profileUploading}
                                onClick={() => profileFileInputRef.current?.click()}
                              >
                                {profileUploading ? i18nText.etcUploading : i18nText.btnSelectPhoto}
                              </button>
                              {profileFileSq.trim() !== "" && (
                                <button
                                  type="button"
                                  className="btn btn_default_h35"
                                  style={{ flexShrink: 0, alignSelf: "flex-start" }}
                                  disabled={profileUploading}
                                  onClick={() => {
                                    setProfileFileSq("");
                                    setProfileImgFailed(false);
                                  }}
                                >
                                  {i18nText.btnDeletePhoto}
                                </button>
                              )}
                            </div>
                          </dd>
                        </dl>
                        {duplicateCheckOutcome != null && (
                          <p style={{ margin: 0, fontSize: "12px", gridColumn: "1 / -1", color: "#475569" }}>
                            {duplicateCheckOutcome === "ok" ? i18nText.msgAvailableId : i18nText.msgUnavailableId}
                          </p>
                        )}
                        <dl>
                          <dt>
                            {i18nText.labelUserName} <span className="req">*</span>
                          </dt>
                          <dd>
                            <input
                              type="text"
                              className="f_input w_full"
                              value={userBasic.userNm ?? ""}
                              onChange={(e) => setUserBasic((u) => ({ ...u, userNm: e.target.value }))}
                              maxLength={MAX_USER.USER_NM}
                            />
                          </dd>
                        </dl>
                        <dl>
                          <dt>
                            {i18nText.labelUserEngName} <span className="req">*</span>
                          </dt>
                          <dd>
                            <input type="text" className="f_input w_full" value={userBasic.userEngNm ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, userEngNm: e.target.value }))} maxLength={MAX_USER.USER_ENG_NM} />
                          </dd>
                        </dl>
                        <dl><dt>{i18nText.labelGender}</dt><dd>
                          <select className="f_select w_full" value={userBasic.genderCd ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, genderCd: e.target.value }))}>
                            <option value="">{i18nText.etcSelect}</option>
                            {genderOptions.map((o) => <option key={o.langSectionCode} value={o.langSectionCode}>{o.langSectionName}</option>)}
                          </select>
                        </dd></dl>
                        <dl><dt>{i18nText.labelBirthDate}</dt><dd><input type="date" className="f_input w_full" value={formatYmd(userBasic.brthdy ?? "")} onChange={(e) => setUserBasic((u) => ({ ...u, brthdy: toYmd(e.target.value) }))} /></dd></dl>
                        <dl>
                          <dt>{i18nText.labelZipCode}</dt>
                          <dd>
                            <input type="text" className="f_input w_full" value={userBasic.zipCd ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, zipCd: e.target.value }))} placeholder={i18nText.placeholderZipCodePh} maxLength={MAX_USER.ZIP_CD} />
                          </dd>
                        </dl>
                        <dl>
                          <dt>{i18nText.labelCity}</dt>
                          <dd>
                            <input type="text" className="f_input w_full" value={userBasic.cityNm ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, cityNm: e.target.value }))} maxLength={MAX_USER.CITY_NM} />
                          </dd>
                        </dl>
                        <dl>
                          <dt>{i18nText.labelAddress1}</dt>
                          <dd>
                            <input type="text" className="f_input w_full" value={userBasic.adresOne ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, adresOne: e.target.value }))} maxLength={MAX_USER.ADRES_ONE} />
                          </dd>
                        </dl>
                        <dl>
                          <dt>{i18nText.labelAddress2}</dt>
                          <dd>
                            <input type="text" className="f_input w_full" value={userBasic.adresTwo ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, adresTwo: e.target.value }))} maxLength={MAX_USER.ADRES_TWO} />
                          </dd>
                        </dl>
                        <dl><dt>{i18nText.labelState}</dt><dd><input type="text" className="f_input w_full" value={userBasic.stateNm ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, stateNm: e.target.value }))} maxLength={MAX_USER.STATE_NM} /></dd></dl>
                        <dl><dt>{i18nText.labelCountry}</dt><dd><input type="text" className="f_input w_full" value={userBasic.nationCd ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, nationCd: e.target.value }))} placeholder={i18nText.placeholderCountryKr} maxLength={MAX_USER.NATION_CD} /></dd></dl>
                        <dl><dt>{i18nText.labelPhone}</dt><dd><input type="text" className="f_input w_full" value={userBasic.houseTelno ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, houseTelno: e.target.value }))} maxLength={MAX_USER.HOUSE_TELNO} /></dd></dl>
                        <dl><dt>{i18nText.labelMobile}</dt><dd><input type="text" className="f_input w_full" value={userBasic.mbtlnum ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, mbtlnum: e.target.value }))} maxLength={MAX_USER.MBTLNUM} /></dd></dl>
                        <dl><dt>{i18nText.labelFax}</dt><dd><input type="text" className="f_input w_full" value={userBasic.fxnum ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, fxnum: e.target.value }))} maxLength={MAX_USER.FXNUM} /></dd></dl>
                        <dl><dt>{i18nText.labelEmail}</dt><dd><input type="email" className="f_input w_full" value={userBasic.emailAdres ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, emailAdres: e.target.value }))} maxLength={MAX_USER.EMAIL_ADRES} /></dd></dl>
                        {isNewUser ? (
                          <>
                            <dl>
                              <dt>
                                {i18nText.labelPassword} <span className="req">*</span>
                              </dt>
                              <dd>
                                <input type="password" className="f_input w_full" value={userBasic.password ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, password: e.target.value }))} maxLength={MAX_USER.PASSWORD} />
                              </dd>
                            </dl>
                            <dl>
                              <dt>
                                {i18nText.labelPasswordConfirm} <span className="req">*</span>
                              </dt>
                              <dd>
                                <input type="password" className="f_input w_full" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} maxLength={MAX_USER.PASSWORD} />
                              </dd>
                            </dl>
                          </>
                        ) : (
                          <dl style={{ gridColumn: "1 / -1" }}>
                            <dt>{i18nText.labelPassword}</dt>
                            <dd>
                              <input
                                type="password"
                                className="f_input w_full"
                                value={userBasic.password ?? ""}
                                onChange={(e) => setUserBasic((u) => ({ ...u, password: e.target.value }))}
                                placeholder={i18nText.placeholderKeepPasswordIfEmpty}
                                maxLength={MAX_USER.PASSWORD}
                              />
                            </dd>
                          </dl>
                        )}
                        <dl><dt>{i18nText.labelPasswordHint}</dt><dd>
                          <select className="f_select w_full" value={userBasic.passwordHint ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, passwordHint: e.target.value }))}>
                            <option value="">{i18nText.etcSelect}</option>
                            {passwordHintOptions.map((o) => <option key={o.langSectionCode} value={o.langSectionCode}>{o.langSectionName}</option>)}
                          </select>
                        </dd></dl>
                        <dl><dt>{i18nText.labelPasswordAnswer}</dt><dd><input type="text" className="f_input w_full" value={userBasic.passwordCnsr ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, passwordCnsr: e.target.value }))} maxLength={MAX_USER.PASSWORD_CNSR} /></dd></dl>
                      </div>
                    </div>
                  </div>
                  <div className="md-form-card" style={{ padding: "20px 22px" }}>
                    <h3 className="system-subtitle" style={{ marginTop: 0, marginBottom: "6px" }}>{i18nText.titleCompanyInfoSection}</h3>
                    <div className="board_view2 md-program-edit-form" style={{ width: "100%", boxSizing: "border-box" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", alignItems: "start" }}>
                        <dl><dt>{i18nText.labelEmployeeNo}</dt><dd><input type="text" className="f_input w_full" value={companyInfo.emplNo ?? ""} onChange={(e) => setCompanyInfo((c) => ({ ...c, emplNo: e.target.value }))} maxLength={MAX_MBRSH.EMPL_NO} /></dd></dl>
                        <dl><dt>{i18nText.labelPhone}</dt><dd><input type="text" className="f_input w_full" value={companyInfo.offmTelno ?? ""} onChange={(e) => setCompanyInfo((c) => ({ ...c, offmTelno: e.target.value }))} maxLength={MAX_MBRSH.OFFM_TELNO} /></dd></dl>
                        <dl><dt>{i18nText.labelEmail}</dt><dd><input type="text" className="f_input w_full" value={companyInfo.emailAdres ?? ""} onChange={(e) => setCompanyInfo((c) => ({ ...c, emailAdres: e.target.value }))} maxLength={MAX_MBRSH.EMAIL_ADRES} /></dd></dl>
                        <dl><dt>{i18nText.labelPosition}</dt><dd>
                          <select className="f_select w_full" value={companyInfo.ofcpsCd ?? ""} onChange={(e) => setCompanyInfo((c) => ({ ...c, ofcpsCd: e.target.value }))}>
                            <option value="">{i18nText.etcSelect}</option>
                            {ofcpsOptions.map((o) => <option key={o.langSectionCode} value={o.langSectionCode}>{o.langSectionName}</option>)}
                          </select>
                        </dd></dl>
                        <dl><dt>{i18nText.labelHireDate}</dt><dd><input type="date" className="f_input w_full" value={formatYmd(companyInfo.ecnyYmd ?? "")} onChange={(e) => setCompanyInfo((c) => ({ ...c, ecnyYmd: toYmd(e.target.value) }))} /></dd></dl>
                        <dl><dt>{i18nText.labelLeaveDate}</dt><dd><input type="date" className="f_input w_full" value={formatYmd(companyInfo.retireYmd ?? "")} onChange={(e) => setCompanyInfo((c) => ({ ...c, retireYmd: toYmd(e.target.value) }))} /></dd></dl>
                        <dl style={{ gridColumn: "1 / -1" }}><dt>{i18nText.labelDeptName} <span className="req">*</span></dt><dd style={{ display: "flex", gap: "8px" }}>
                          <input type="text" className="f_input w_full" readOnly value={companyInfo.deptNm ?? ""} placeholder={i18nText.placeholderSelectDeptSearch} />
                          <button type="button" className="btn btn_blue_h46 w180x" onClick={() => openDeptSearch((deptCd, deptNm) => setCompanyInfo((c) => ({ ...c, deptCd, deptNm })))}>{i18nText.btnDeptSearchQ}</button>
                        </dd></dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dept" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: "680px", height: "calc(100vh - 120px)", minWidth: 0 }}>
                {/* 한 줄: 왼쪽 260px 영역에 부서 리스트, 오른쪽 영역에 부서 정보·버튼 (회사 사용자 리스트와 동일한 LEFT) */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0, height: "30px" }}>
                  <div style={{ width: "260px", minWidth: "260px", flexShrink: 0 }}>
                    <h3 className="system-subtitle" style={{ margin: 0, alignSelf: "flex-end", marginTop: "14px", marginLeft: "5px" }}>{i18nText.titleDeptList}</h3>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 className="system-subtitle" style={{ margin: 0, flexShrink: 0, alignSelf: "flex-end", marginTop: "14px", marginLeft: "5px" }}>{i18nText.titleDeptInfo}</h3>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                      <button type="button" className="btn btn_blue_h46 btn-slim author-role-searchbar__btn" onClick={handleDeptInit}>{i18nText.btnReset}</button>
                      <button
                        type="button"
                        className="btn btn_delete btn-slim author-role-searchbar__btn"
                        onClick={handleDeleteDept}
                        disabled={!companyCode || isDeptNewEntryMode || !selectedDeptCd || selectedDeptCd === "#"}
                      >
                        {i18nText.btnDelete}
                      </button>
                      <button type="button" className="btn btn_blue_h46 btn-slim author-role-searchbar__btn" onClick={handleSaveDept}>{i18nText.btnSave}</button>
                    </div>
                  </div>
                </div>
                {/* 부서 리스트 박스와 부서 정보 박스 TOP 동일 (alignItems: flex-start) */}
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flex: 1, minHeight: 0, overflow: "hidden" }}>
                  {/* 왼쪽: 부서 리스트 (트리) md-form-card 네모박스 */}
                  <div style={{ width: "260px", minWidth: "260px", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0, alignSelf: "stretch" }}>
                    <div
                      className="md-form-card"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        padding: "12px 16px",
                      }}
                    >
                      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "5px 0" }}>
                        {deptTree.length === 0 ? (
                          <p className="no_data">{i18nText.msgLoadDeptTreeAfterCompany}</p>
                        ) : deptTreeHierarchy.length === 0 ? (
                          <p className="no_data">{i18nText.msgNoDepartment}</p>
                        ) : (
                          deptTreeHierarchy.map((node, idx) => renderDeptTreeNodeForTab(node, 0, idx === deptTreeHierarchy.length - 1))
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 오른쪽: 부서 정보 박스 + 회사/부서 사용자 리스트 */}
                  <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: "16px", alignSelf: "stretch" }}>
                    {/* 부서 정보 (2열) - 네모박스 TOP이 부서 리스트 박스와 동일 */}
                    <div className="md-form-card" style={{ padding: "12px 16px", flexShrink: 0 }}>
                      <div className="board_view2 md-program-edit-form">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", alignItems: "start" }}>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelDeptCode} <span className="req">*</span></dt><dd><input ref={deptCdInputRef} type="text" className="f_input w_full" value={deptDetail?.deptCd ?? ""} readOnly={!isDeptNewEntryMode} maxLength={20} onChange={(e) => setDeptDetail((prev) => (prev ? { ...prev, deptCd: e.target.value } : null))} /></dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelDeptName} <span className="req">*</span></dt><dd style={{ display: "flex", gap: "6px", alignItems: "center" }}><input type="text" className="f_input w_full" value={deptDetail?.deptNm ?? ""} readOnly placeholder={i18nText.placeholderSelectMultilingual} style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} /><SearchIconButton title={i18nText.etcTitleMultilingualLookup} onClick={() => { if (!companyCode.trim()) { alert(i18nText.msgSelectCompanyReq); return; } setShowDeptMultilingualPopup(true); }} /></dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelParentDeptCode} <span className="req">*</span></dt><dd><input type="text" className="f_input w_full" value={deptDetail?.upperDeptCd ?? ""} readOnly={!isDeptNewEntryMode} maxLength={20} onChange={(e) => setDeptDetail((prev) => (prev ? { ...prev, upperDeptCd: e.target.value } : null))} /></dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelParentDeptName} <span className="req">*</span></dt><dd style={{ display: "flex", gap: "6px", alignItems: "center" }}><input type="text" className="f_input w_full" value={deptDetail?.upperDeptNm ?? ""} readOnly={!isDeptNewEntryMode} onChange={(e) => setDeptDetail((prev) => (prev ? { ...prev, upperDeptNm: e.target.value } : null))} /><SearchIconButton title={i18nText.etcTitleDeptSearch} onClick={() => openDeptSearch((deptCd, deptNm) => setDeptDetail((prev) => (prev ? { ...prev, upperDeptCd: deptCd, upperDeptNm: deptNm } : null)))} /></dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelDeptLevel}</dt><dd>
                            <select className="f_select w_full" value={deptDetail?.deptGradCd ?? ""} onChange={(e) => setDeptDetail((prev) => (prev ? { ...prev, deptGradCd: e.target.value } : null))}><option value="">{i18nText.etcSelect}</option>{deptGradOptions.map((o) => <option key={o.langSectionCode} value={o.langSectionCode}>{o.langSectionName}</option>)}</select>
                          </dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelDeptHeadName}</dt><dd style={{ display: "flex", gap: "6px", alignItems: "center" }}><input type="text" className="f_input w_full" value={deptDetail?.dprlrNm ?? ""} readOnly placeholder={i18nText.labelDeptHeadName} style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} /><SearchIconButton title={i18nText.titleDeptHeadSelect} onClick={() => { setOnSelectUserCallback(() => (mbrshSq, _userId, userNm) => { setDeptDetail((prev) => (prev ? { ...prev, dprlrMbrshSq: String(mbrshSq), dprlrId: String(mbrshSq), dprlrNm: userNm ?? "" } : null)); }); setShowUserSearchPopup(true); }} /></dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelExpireDate}</dt><dd><input type="date" className="f_input w_full" value={formatYmd(deptDetail?.exprtnYmd ?? "")} onChange={(e) => setDeptDetail((prev) => (prev ? { ...prev, exprtnYmd: toYmd(e.target.value) } : null))} /></dd></dl>
                          <dl style={{ margin: 0 }}><dt>{i18nText.labelSortOrder}</dt><dd><input type="text" className="f_input w_full" value={deptDetail?.sortOrd ?? ""} onChange={(e) => setDeptDetail((prev) => (prev ? { ...prev, sortOrd: e.target.value.slice(0, 5) } : null))} maxLength={5} placeholder={i18nText.etcPlaceholderSortOrdMax} /></dd></dl>
                          <dl style={{ margin: 0, gridColumn: "1 / -1" }}>
                            <dt>{i18nText.labelUseYn} <span className="req">*</span></dt>
                            <dd>
                              <div className="radio-group">
                                <label className="radio-label">
                                  <input type="radio" name="deptUseFl" checked={deptDetail?.useFl === "Y"} onChange={() => setDeptDetail((prev) => (prev ? { ...prev, useFl: "Y" } : null))} disabled={!deptDetail} />
                                  <span>{i18nText.etcUse}</span>
                                </label>
                                <label className="radio-label">
                                  <input type="radio" name="deptUseFl" checked={deptDetail?.useFl === "N"} onChange={() => setDeptDetail((prev) => (prev ? { ...prev, useFl: "N" } : null))} disabled={!deptDetail} />
                                  <span>{i18nText.etcNotUse}</span>
                                </label>
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    {/* 하단: 회사 사용자 리스트 | 중앙 화살표 버튼 | 부서 사용자 리스트 (권한 상세 사용자탭과 동일) */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "stretch", flex: 1, minHeight: 0, overflow: "hidden" }}>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                        <h3 className="system-subtitle" style={{ marginBottom: "8px" }}>{i18nText.titleCompanyUserList}</h3>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexShrink: 0, alignItems: "center" }}>
                          <input type="text" className="f_input author-role-searchbar__input" placeholder={i18nText.placeholderSearchUserNameId} value={companyUserSearchKeywordForDept} onChange={(e) => setCompanyUserSearchKeywordForDept(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadCompanyUserListForDept()} style={{ flex: "0 0 270px", maxWidth: "100%" }} />
                          <button type="button" className="btn btn_blue_h46 btn-slim author-role-searchbar__btn" onClick={() => loadCompanyUserListForDept()}>{i18nText.btnSearch}</button>
                        </div>
                        <div className="board_list BRD006 md-admin-list" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", border: "1px solid var(--md-outline, #dde2e5)", overflow: "hidden" }}>
                          <div className="head head--compact" style={{ flexShrink: 0 }}>
                            <span className="md-col-chk"><input type="checkbox" checked={companyUserListForDept.length > 0 && selectedCompanyUserMbrshSq.size === companyUserListForDept.length} onChange={(e) => setSelectedCompanyUserMbrshSq(e.target.checked ? new Set(companyUserListForDept.map((u) => u.mbrshSq)) : new Set())} aria-label={i18nText.etcAllSelect} /></span>
                            <span className="md-col-no">{i18nText.labelNo}</span>
                            <span>{i18nText.labelUserId}</span>
                            <span>{i18nText.labelUserName}</span>
                            <span>{i18nText.labelDeptName}</span>
                            <span>{i18nText.labelPosition}</span>
                          </div>
                          <div className="result" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                            {!companyCode ? (
                              <p className="no_data">{i18nText.msgSelectCompany}</p>
                            ) : companyUserListForDept.length === 0 ? (
                              <p className="no_data">{i18nText.placeholderLoadCompanyUsers}</p>
                            ) : (
                              companyUserListForDept.map((u, idx) => (
                                <div key={u.mbrshSq} className="list_item">
                                  <div className="md-col-chk"><input type="checkbox" checked={selectedCompanyUserMbrshSq.has(u.mbrshSq)} onChange={() => setSelectedCompanyUserMbrshSq((prev) => { const n = new Set(prev); if (n.has(u.mbrshSq)) n.delete(u.mbrshSq); else n.add(u.mbrshSq); return n; })} aria-label={`${u.userNm}${i18nText.ariaSelectSuffix}`} /></div>
                                  <div className="md-col-no">{companyUserListForDept.length - idx}</div>
                                  <div>{u.userId}</div>
                                  <div>{u.userNm}</div>
                                  <div>{u.deptNm ?? ""}</div>
                                  <div>{u.ofcpsNm ?? ""}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      {/* 이동 버튼 (권한 상세 사용자탭과 동일: 선택 후 ▶ 부서 추가, ◀ 부서 삭제) */}
                      <div className="transfer-arrows" style={{ marginTop: "110px" }}>
                        <button type="button" className="arr-btn" onClick={handleAddUsersToDept} title={i18nText.etcTitleAddToDept}><i className="ph ph-caret-right" /></button>
                        <button type="button" className="arr-btn" onClick={handleRemoveUsersFromDept} title={i18nText.etcTitleRemoveFromDept}><i className="ph ph-caret-left" /></button>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", border: "1px solid var(--md-outline, #dde2e5)", borderRadius: "var(--md-radius-md, 8px)" }}>
                        <div className="sub-panel-header">{i18nText.titleDeptUserList}</div>
                        <div style={{ display: "flex", gap: "8px", padding: "6px 8px", flexShrink: 0, alignItems: "center", borderBottom: "1px solid #eaeaea" }}>
                          <input type="text" className="f_input author-role-searchbar__input" placeholder={i18nText.placeholderSearchUserNameId} value={deptSearchKeyword} onChange={(e) => setDeptSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadDeptUserList()} style={{ flex: "0 0 270px", maxWidth: "100%" }} />
                          <button type="button" className="btn btn_blue_h46 btn-slim author-role-searchbar__btn" onClick={loadDeptUserList}>{i18nText.btnSearch}</button>
                        </div>
                        <div className="board_list BRD006 md-admin-list" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                          <div className="head head--compact" style={{ flexShrink: 0 }}>
                            <span className="md-col-chk"><input type="checkbox" checked={deptUserList.length > 0 && selectedDeptUserMbrshSq.size === deptUserList.length} onChange={(e) => setSelectedDeptUserMbrshSq(e.target.checked ? new Set(deptUserList.map((u) => String(u.mbrshSq))) : new Set())} aria-label={i18nText.etcAllSelect} /></span>
                            <span className="md-col-no">{i18nText.labelNo}</span>
                            <span>{i18nText.labelUserId}</span>
                            <span>{i18nText.labelUserName}</span>
                            <span>{i18nText.labelDeptName}</span>
                          </div>
                          <div className="result" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                            {!selectedDeptCd ? (
                              <p className="no_data">{i18nText.msgSelectDept}</p>
                            ) : deptUserList.length === 0 ? (
                              <p className="no_data">{i18nText.msgNoUsersInDept}</p>
                            ) : (
                              deptUserList.map((u, idx) => (
                                <div key={u.mbrshSq} className="list_item">
                                  <div className="md-col-chk"><input type="checkbox" checked={selectedDeptUserMbrshSq.has(String(u.mbrshSq))} onChange={() => setSelectedDeptUserMbrshSq((prev) => { const k = String(u.mbrshSq); const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; })} aria-label={`${u.userNm}${i18nText.ariaSelectSuffix}`} /></div>
                                  <div className="md-col-no">{deptUserList.length - idx}</div>
                                  <div>{u.userId}</div>
                                  <div>{u.userNm}</div>
                                  <div>{u.deptNm ?? ""}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeptPopup && (
        <DeptSearchPopup
          companyCode={companyCode}
          langCode={langCode}
          onSelect={(deptCd, deptNm) => {
            onSelectDeptCallback?.(deptCd, deptNm);
            setShowDeptPopup(false);
            setOnSelectDeptCallback(null);
          }}
          onClose={() => { setShowDeptPopup(false); setOnSelectDeptCallback(null); }}
        />
      )}
      <MultilingualLookupPopup
        open={showDeptMultilingualPopup}
        onClose={() => setShowDeptMultilingualPopup(false)}
        cmpnyCd={companyCode}
        langCode={langCode}
        onSelect={(langKey, displayMessage) => {
          setDeptDetail((prev) => (prev ? { ...prev, deptNmKey: langKey, deptNm: displayMessage } : null));
        }}
      />
      {showUserSearchPopup && (
        <UserSearchPopup
          t={i18nText}
          companyCode={companyCode}
          langCode={langCode}
          onSelect={(mbrshSq, userId, userNm) => {
            onSelectUserCallback?.(mbrshSq, userId, userNm);
            setShowUserSearchPopup(false);
            setOnSelectUserCallback(null);
          }}
          onClose={() => { setShowUserSearchPopup(false); setOnSelectUserCallback(null); }}
        />
      )}
    </div>
  );
}

function UserSearchPopup({
  t,
  companyCode,
  langCode,
  onSelect,
  onClose,
}: {
  t: CmmnUserI18nText;
  companyCode: string;
  langCode: string;
  onSelect: (mbrshSq: number, userId: string, userNm: string) => void;
  onClose: () => void;
}) {
  const uid = useId();
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState<{ mbrshSq: number; userId: string; userNm?: string; user_nm?: string; deptNm?: string }[]>([]);

  useEffect(() => {
    if (!companyCode) return;
    const params = new URLSearchParams();
    params.set("companyCode", companyCode);
    params.set("langCode", langCode);
    if (keyword.trim()) params.set("searchKeyword", keyword.trim());
    EgovNet.requestFetch(
      `${API}/userSearch?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => setList(resp?.result && Array.isArray(resp.result) ? resp.result : []),
      () => setList([])
    );
  }, [companyCode, langCode, keyword]);

  const handleRowPick = (item: { mbrshSq: number; userId: string; userNm?: string; user_nm?: string }) => {
    const nm = (item.userNm ?? item.user_nm ?? "").trim();
    onSelect(Number(item.mbrshSq), String(item.userId ?? ""), nm);
  };

  return (
    <div
      className="wrap_pop"
      style={{ display: "block", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="pop_inner"
        style={{
          width: "1200px",
          maxWidth: "95vw",
          height: "800px",
          maxHeight: "90vh",
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          backgroundColor: "#fff",
          borderRadius: "5px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby={`${uid}-usr-title`}
      >
        <div className="pop_header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h1 id={`${uid}-usr-title`} style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
            {t.titleDeptHeadSelect}
          </h1>
          <button type="button" className="pop_close" onClick={onClose} aria-label={t.etcCloseAria} />
        </div>

        <div className="pop_container" style={{ padding: "20px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="condition md-condition md-condition-plain-row">
            <div className="left-box">
              <label className="f_input" htmlFor={`${uid}-keyword`} style={{ width: "300px", flex: "0 0 300px" }}>
                <input
                  type="text"
                  id={`${uid}-keyword`}
                  className="f_input"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t.placeholderSearchUserNameId}
                  onKeyDown={(e) => e.key === "Enter" && setKeyword(e.currentTarget.value)}
                />
              </label>
              <button type="button" className="pd-btn primary" onClick={() => setKeyword(keyword)}>
                {t.btnSearchSecondary}
              </button>
            </div>
          </div>

          <div className="board_list BRD006 md-admin-list board_list--flat" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="head">
              <span className="md-col-no">{t.labelNo}</span>
              <span className="md-col-id">{t.labelUserId}</span>
              <span className="md-col-name">{t.labelUserName}</span>
              <span className="md-col-name">{t.labelDeptName}</span>
            </div>
            <div className="result" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {list.length > 0 ? (
                list.map((item, index) => (
                  <div
                    key={item.mbrshSq}
                    className="list_item"
                    onClick={() => handleRowPick(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowPick(item);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="md-col-no">{list.length - index}</div>
                    <div className="md-col-id">{item.userId}</div>
                    <div className="md-col-name">{item.userNm ?? item.user_nm ?? ""}</div>
                    <div className="md-col-name">{item.deptNm ?? ""}</div>
                  </div>
                ))
              ) : (
                <div className="no_data" style={{ textAlign: "center", padding: "40px" }}>
                  {t.msgNoSearchResult}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList;
