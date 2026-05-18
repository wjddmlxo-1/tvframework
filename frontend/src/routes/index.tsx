import { useEffect, useState, useRef, useCallback } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import URL from "@/constants/url";
import CODE from "@/constants/code";

//COMMON
import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import Footer from "@/components/Footer";
import PopupNoticeLayer from "@/components/PopupNoticeLayer";
import Error from "@/components/Error";

import Main from "@/pages/main/Main";
import Login from "@/pages/login/Login";

//SNS
import SnsNaverCallback from "@/components/sns/SnsNaverCallback";
import SnsKakaoCallback from "@/components/sns/SnsKakaoCallback";

//SYSTEM
import CmmnMessageList from "@/pages/system/message/CmmnMessageList";
import CmmnMessageDetail from "@/pages/system/message/CmmnMessageDetail";
import CmmnMessageEdit from "@/pages/system/message/CmmnMessageEdit";

import CmmnCodeList from "@/pages/system/code/CmmnCodeList";

import CmmnProgramList from "@/pages/system/program/CmmnProgramList";
import CmmnProgramDetail from "@/pages/system/program/CmmnProgramDetail";
import CmmnProgramEdit from "@/pages/system/program/CmmnProgramEdit";

import CmmnMenuList from "@/pages/system/menu/CmmnMenuList";

import CmmnGroupList from "@/pages/system/group/CmmnGroupList";
import CmmnGroupEdit from "@/pages/system/group/CmmnGroupEdit";

import CmmnCompanyList from "@/pages/system/company/CmmnCompanyList";
import CmmnCompanyEdit from "@/pages/system/company/CmmnCompanyEdit";

import CmmnAuthorManage from "@/pages/system/author/CmmnAuthorManage";
import CmmnAuthorEdit from "@/pages/system/author/CmmnAuthorEdit";

import WidgetDataSetList from "@/pages/sites/widget/WidgetDataSetList";
import WidgetStyleList from "@/pages/sites/widget/WidgetStyleList";
import WidgetList from "@/pages/sites/widget/WidgetList";
import BbsList from "@/pages/sites/bbs/BbsList";
import BbsUserList from "@/pages/main/BbsUserList";
import BbsUserWrite from "@/pages/main/BbsUserWrite";

// 시스템관리/사용자관리·사용자 암호변경
import UserList from "@/pages/system/user/UserList";
import UserPasswordUpdate from "@/pages/system/user/UserPasswordUpdate";
//마이페이지 기능 추가
import MypageProfile from "@/pages/mypage/MypageProfile";
import UserJoin from "@/pages/system/UserJoin";
import initPage from "@/js/ui";

const RootRoutes = () => {
  const location = useLocation();

  // 시스템관리·마이페이지 동일 패턴: 로그인 필수 경로
  const checkPathAccess = useCallback(() => {
    const currentPath = location.pathname;
    const systemRegex = /^\/tvframework\/system(\/.*)?$/;
    const sitesRegex = /^\/tvframework\/sites(\/.*)?$/;
    const mainBbsRegex = /^\/tvframework\/main\/bbs(\/.*)?$/;
    const mypageRegex = /^\/mypage(\/.*)?$/;
    const loginRequired = (path: string) => {
      const norm = path.replace(/\/+$/, "") || "/";
      const joinPath = URL.MYPAGE_CREATE.replace(/\/+$/, "") || "/";
      if (norm === joinPath) return false;
      return systemRegex.test(path) || sitesRegex.test(path) || mainBbsRegex.test(path) || mypageRegex.test(path);
    };

    const token = sessionStorage.getItem("jToken");

    if (!token) {
      if (loginRequired(currentPath)) {
        setMounted(false);
        alert("로그인이 필요한 경로입니다.");
        window.location.href = URL.LOGIN;
        return false;
      }
      setMounted(true);
      return true;
    }

    setMounted(true);
    return true;
  }, [location.pathname]);

  const isMounted = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
    checkPathAccess();
  }, [checkPathAccess]);

  if (mounted) {
    return (
      <Routes>
        <Route path={URL.ERROR} element={<Error />} />
        <Route path="*" element={<SecondRoutes />} />
      </Routes>
    );
  }

  return null;
};

const SecondRoutes = () => {
  // eslint-disable-next-line no-unused-vars
  const [loginVO, setLoginVO] = useState<any>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  //useRef객체를 사용하여 페이지 마운트 된 후 ui.js를 로딩 하도록 변경 코드 추가(아래)
  const isMounted = useRef(false); // 아래 로그인 이동 부분이 2번 실행되지 않도록 즉, 마운트 될 때만 실행되도록 변수 생성

  useEffect(() => {
    if (!isMounted.current) {
      // 컴포넌트 최초 마운트 시 페이지 진입 전(렌더링 전) 실행
      isMounted.current = true; // 이 값으로 true 일 때만 페이지를 렌더링이 되는 변수 사용.
    } else {
      initPage();
    }
  }, []);

  return (
    <Routes>
      {/* 로그인·SNS 콜백: 페이지 단독 (헤더/사이드바/푸터 없음) */}
      <Route
        path={URL.LOGIN}
        element={<Login onChangeLogin={(user: any) => setLoginVO(user)} />}
      />
      <Route
        path={URL.SNS_NAVER_CB}
        element={
          <SnsNaverCallback onChangeLogin={(user: any) => setLoginVO(user)} />
        }
      />
      <Route
        path={URL.SNS_KAKAO_CB}
        element={
          <SnsKakaoCallback onChangeLogin={(user: any) => setLoginVO(user)} />
        }
      />

      {/* 회원가입: 로그인 없이 헤더/사이드 없이 표시 (/cmmnMessage/companies 등 401 유발 방지) */}
      <Route path={URL.MYPAGE_CREATE} element={<UserJoin />} />

      {/* 그 외: 헤더 + 사이드바 + 본문 레이아웃 (전체 둥근 네모 안에) */}
      <Route
        path="*"
        element={
          <div className="app-rounded-frame">
            <Header />
            <div className="app-layout app-layout--sidebar">
              <aside className="icon-rail">
                <nav className="rail-nav">
                  <a className="rail-item active" href="#" data-tip="Overview"><i className="ph-fill ph-squares-four"></i></a>
                  <a className="rail-item" href="#" data-tip="Scan"><i className="ph ph-scan"></i></a>
                  <a className="rail-item" href="#" data-tip="Gallery"><i className="ph ph-image-square"></i></a>
                  <a className="rail-item" href="#" data-tip="Code"><i className="ph ph-code"></i></a>
                  <div className="rail-divider"></div>
                  <a className="rail-item" href="#" data-tip="Design"><i className="ph ph-paint-brush"></i></a>
                  <a className="rail-item" href="#" data-tip="Folders"><i className="ph ph-folder"></i></a>
                  <a className="rail-item" href="#" data-tip="Calendar"><i className="ph ph-calendar"></i></a>
                </nav>
                <div className="rail-bottom">
                  <button
                    type="button"
                    className="rail-item sidebar-collapse-btn"
                    onClick={() => setSidebarCollapsed((v) => !v)}
                    title={sidebarCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
                    aria-label={sidebarCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
                    data-tip={sidebarCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
                  >
                    <i className={`ph ${sidebarCollapsed ? "ph-arrow-right" : "ph-arrow-left"}`}></i>
                  </button>
                  <button
                    type="button"
                    className="rail-item"
                    onClick={() => setRightPanelOpen((v) => !v)}
                    title={rightPanelOpen ? "패널 닫기" : "패널 열기"}
                    aria-label={rightPanelOpen ? "패널 닫기" : "패널 열기"}
                    data-tip={rightPanelOpen ? "패널 닫기" : "패널 열기"}
                  >
                    <i className="ph ph-sidebar-simple" style={{ transform: 'scaleX(-1)' }}></i>
                  </button>
                </div>
              </aside>
              <LeftSidebar collapsed={sidebarCollapsed} />

              {/* RIGHT PANEL */}
              <aside className={`right-panel${rightPanelOpen ? "" : " collapsed"}`} id="rightPanel">
                <div className="rp-header">
                  <span className="rp-title">Overview</span>
                  <button className="rp-close" onClick={() => setRightPanelOpen(false)}>
                    <i className="ph ph-x"></i>
                  </button>
                </div>
                <div className="rp-body">
                  <div className="rp-section">
                    <div className="rp-item active"><i className="ph ph-star"></i> Favorites</div>
                    <div className="rp-item"><i className="ph ph-clock-counter-clockwise"></i> Recent Items</div>
                    <div className="rp-item"><i className="ph ph-bookmark"></i> Saved Views</div>
                    <div className="rp-item"><i className="ph ph-ticket"></i> New Ticket</div>
                    <div className="rp-item"><i className="ph ph-chat-circle-dots"></i> Slack Messages</div>
                    <div className="rp-item"><i className="ph ph-warning"></i> SLA Breaches</div>
                    <div className="rp-item"><i className="ph ph-user-plus"></i> Add Client</div>
                    <div className="rp-item"><i className="ph ph-file-plus"></i> New Report</div>
                    <div className="rp-item"><i className="ph ph-export"></i> Export Data</div>
                    <div className="rp-item"><i className="ph ph-bell"></i> All Alerts</div>
                    <div className="rp-item"><i className="ph ph-bell-ringing"></i> Notifications</div>
                    <div className="rp-item"><i className="ph ph-funnel"></i> Segments</div>
                    <div className="rp-item"><i className="ph ph-buildings"></i> Account A-Site</div>
                    <div className="rp-item"><i className="ph ph-question"></i> User Guidance</div>
                  </div>
                </div>
              </aside>

              <main className="app-layout__content">
                <Routes>
                  {/* MAIN */}
                  <Route path={URL.MAIN} element={<Main />} />

                  {/* 사용자 게시판 */}
                  <Route path={URL.MAIN_BBS} element={<BbsUserList />} />
                  <Route path={URL.MAIN_BBS_WRITE} element={<BbsUserWrite />} />

                  {/* ERROR */}
                  <Route path={URL.ERROR} element={<Error />} />

                  {/* 제거된 고객지원(자료실·QnA·서비스신청) 구 URL은 메인으로 이동 */}
                  <Route path="/tvframework/support/*" element={<Navigate to={URL.MAIN} replace />} />

                  {/* SYSTEM */}
                  {/* 더 구체적인 경로를 먼저 배치 */}
                  <Route path={URL.SYSTEM_MESSAGE} element={<CmmnMessageList />} />
                  <Route
                    path={URL.SYSTEM_MESSAGE_DETAIL}
                    element={<CmmnMessageDetail />}
                  />
                  <Route
                    path={URL.SYSTEM_MESSAGE_CREATE}
                    element={<CmmnMessageEdit mode={CODE.MODE_CREATE} />}
                  />
                  <Route
                    path={URL.SYSTEM_MESSAGE_MODIFY}
                    element={<CmmnMessageEdit mode={CODE.MODE_MODIFY} />}
                  />
                  <Route
                    path={URL.SYSTEM_MESSAGE_REPLY}
                    element={<CmmnMessageEdit mode={CODE.MODE_REPLY} />}
                  />

                  <Route path={URL.SYSTEM_CODE} element={<CmmnCodeList />} />
                  {/* 공통코드 상세 화면 없음 → 목록으로 통합 */}
                  <Route path={URL.SYSTEM_CODE_DETAIL} element={<Navigate to={URL.SYSTEM_CODE} replace />} />

                  <Route path={URL.SYSTEM_PROGRAM} element={<CmmnProgramList />} />
                  <Route path={URL.SYSTEM_PROGRAM_DETAIL} element={<CmmnProgramDetail />} />
                  <Route
                    path={URL.SYSTEM_PROGRAM_CREATE}
                    element={<CmmnProgramEdit mode={CODE.MODE_CREATE} />}
                  />
                  <Route
                    path={URL.SYSTEM_PROGRAM_MODIFY}
                    element={<CmmnProgramEdit mode={CODE.MODE_MODIFY} />}
                  />

                  <Route path={URL.SYSTEM_MENU} element={<CmmnMenuList />} />

                  <Route path={URL.SYSTEM_GROUP} element={<CmmnGroupList />} />
                  <Route path={URL.SYSTEM_GROUP_CREATE} element={<CmmnGroupEdit mode="create" />} />
                  <Route path={URL.SYSTEM_GROUP_DETAIL} element={<CmmnGroupEdit mode="detail" />} />
                  <Route path={URL.SYSTEM_COMPANY} element={<CmmnCompanyList />} />
                  <Route path={URL.SYSTEM_COMPANY_CREATE} element={<CmmnCompanyEdit mode="create" />} />
                  <Route path={URL.SYSTEM_COMPANY_DETAIL} element={<CmmnCompanyEdit mode="detail" />} />
                  <Route path={URL.SYSTEM_COMPANY_MODIFY} element={<CmmnCompanyEdit mode="modify" />} />

                  <Route path={URL.SYSTEM_AUTHOR} element={<CmmnAuthorManage />} />
                  <Route path={URL.SYSTEM_AUTHOR_CREATE} element={<CmmnAuthorEdit mode="create" />} />
                  <Route path={URL.SYSTEM_AUTHOR_DETAIL} element={<CmmnAuthorEdit mode="detail" />} />

                  {/* SYSTEM 기본 경로는 마지막에 배치하여 다른 경로와 매칭되지 않을 때만 매칭되도록 함 */}
                  <Route path={URL.SYSTEM} element={<Navigate to={URL.SYSTEM_MESSAGE} replace />} />

                  {/* 레거시 LETTNBBS 공지 화면 제거 — 구 URL은 사이트 게시판 관리로 이동 */}
                  <Route path="/tvframework/system/notice" element={<Navigate to={URL.SITES_BBS} replace />} />
                  <Route path="/tvframework/system/notice/detail" element={<Navigate to={URL.SITES_BBS} replace />} />
                  <Route path="/tvframework/system/notice/create" element={<Navigate to={URL.SITES_BBS} replace />} />
                  <Route path="/tvframework/system/notice/modify" element={<Navigate to={URL.SITES_BBS} replace />} />
                  <Route path="/tvframework/system/notice/reply" element={<Navigate to={URL.SITES_BBS} replace />} />

                  {/* 금주의행사 화면 미사용 */}
                  <Route path={URL.SYSTEM_WEEKLY} element={<Navigate to={URL.SYSTEM_MESSAGE} replace />} />
                  <Route path={URL.SYSTEM_WEEKLY_DETAIL} element={<Navigate to={URL.SYSTEM_MESSAGE} replace />} />

                  {/* SITES (사이트관리) */}
                  <Route path={URL.SITES} element={<Navigate to={URL.SITES_WIDGETDATASET} replace />} />
                  <Route path={URL.SITES_WIDGETDATASET} element={<WidgetDataSetList />} />
                  <Route path={URL.SITES_WIDGETDATASET_DETAIL} element={<WidgetDataSetList />} />
                  <Route path={URL.SITES_WIDGETDATASET_CREATE} element={<WidgetDataSetList />} />
                  <Route path={URL.SITES_WIDGETDATASET_MODIFY} element={<WidgetDataSetList />} />

                  <Route path={URL.SITES_WIDGETSTYLE} element={<WidgetStyleList />} />
                  <Route path={URL.SITES_WIDGETSTYLE_DETAIL} element={<WidgetStyleList />} />
                  <Route path={URL.SITES_WIDGETSTYLE_CREATE} element={<WidgetStyleList />} />
                  <Route path={URL.SITES_WIDGETSTYLE_MODIFY} element={<WidgetStyleList />} />

                  <Route path={URL.SITES_WIDGET} element={<WidgetList />} />
                  <Route path={URL.SITES_WIDGET_DETAIL} element={<WidgetList />} />
                  <Route path={URL.SITES_WIDGET_CREATE} element={<WidgetList />} />
                  <Route path={URL.SITES_WIDGET_MODIFY} element={<WidgetList />} />

                  <Route path={URL.SITES_BBS} element={<BbsList />} />
                  <Route path={URL.SITES_BBS_DETAIL} element={<BbsList />} />
                  <Route path={URL.SITES_BBS_CREATE} element={<BbsList />} />
                  <Route path={URL.SITES_BBS_MODIFY} element={<BbsList />} />

                  {/* 시스템관리/사용자관리·사용자 암호변경 */}
                  <Route path={URL.SYSTEM_USER_PASSWORD} element={<UserPasswordUpdate />} />
                  <Route path={URL.SYSTEM_USER} element={<UserList />} />
                  {/* MYPAGE (회원가입은 상단 단독 라우트) */}
                  <Route path={URL.MYPAGE_MODIFY} element={<MypageProfile />} />
                </Routes>
                <PopupNoticeLayer />
              </main>
            </div>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
};

export default RootRoutes;

