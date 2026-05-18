# 다국어 입력 대상 추출

목적: 화면에 하드코딩된 문구를 다국어 테이블 입력용으로 정리한다.

분류 기준:
- 화면별 추출
- 유형 분류: `타이틀` / `레이블` / `플레이스홀더` / `메시지` / `버튼` / `그외`

---

## 다국어관리 (`CmmnMessageList`, `CmmnMessageEdit`, `CmmnMessageDetail`)

참고 소스:
- `frontend/src/pages/system/message/CmmnMessageList.tsx`
- `frontend/src/pages/system/message/CmmnMessageEdit.tsx`
- `frontend/src/pages/system/message/CmmnMessageDetail.tsx`

### 타이틀
- 다국어관리 : title.sysmanage.i18nManage
- 다국어 조회 : title.sysmanage.i18nManage.i18nSearch
- 다국어 추가 : title.sysmanage.i18nManage.i18nCreate
- 다국어 상세조회/수정 : title.sysmanage.i18nManage.i18nDetail

### 레이블
- 시스템관리 : label.sysmanage.i18nManage.system
- 번호 : label.sysmanage.i18nManage.no
- 구분 : label.sysmanage.i18nManage.type
- 언어 Key : label.sysmanage.i18nManage.langKey
- 언어코드 : label.sysmanage.i18nManage.langCode
- 메시지 : label.sysmanage.i18nManage.message
- 언어 : label.sysmanage.i18nManage.language

### 플레이스홀더
- 검색 조건 : placeholder.sysmanage.i18nManage.searchCondition
- 언어 Key를 입력하세요 : placeholder.sysmanage.i18nManage.enterLanguageKey
- {langName} 메시지 입력 : placeholder.sysmanage.i18nManage.enterLangMessage

### 메시지
- 조회 중 오류가 발생했습니다. : message.sysmanage.i18nManage.errorOnRetrieve
- 삭제할 항목을 선택해주세요. : message.sysmanage.i18nManage.selectItemToDelete
- 선택한 항목을 삭제하시겠습니까? : message.sysmanage.i18nManage.confirmDelete
- 삭제되었습니다. : message.sysmanage.i18nManage.deleted
- 삭제 중 오류가 발생했습니다. : message.sysmanage.i18nManage.errorOnDelete
- 업로드되었습니다. : message.sysmanage.i18nManage.uploaded
- 업로드 중 오류가 발생했습니다. : message.sysmanage.i18nManage.errorOnUpload
- 다운로드할 데이터가 없습니다. : message.sysmanage.i18nManage.noDataToDownload
- 언어 목록을 불러올 수 없습니다. : message.sysmanage.i18nManage.failLoadLangList
- 검색된 결과가 없습니다. : message.sysmanage.i18nManage.noSearchResult
- 구분은 필수 입력 항목입니다. : message.sysmanage.i18nManage.requiredCategory
- 언어 Key는 필수 입력 항목입니다. : message.sysmanage.i18nManage.requiredLangKey
- 등록되었습니다. : message.sysmanage.i18nManage.registered
- 수정되었습니다. : message.sysmanage.i18nManage.updated
- 저장 중 오류가 발생했습니다. : message.sysmanage.i18nManage.errorOnSave

### 버튼
- 엑셀 다운로드 : button.sysmanage.i18nManage.excelDownload
- 추가 : button.sysmanage.i18nManage.add
- 삭제 : button.sysmanage.i18nManage.delete
- 조회 : button.sysmanage.i18nManage.search
- 저장 : button.sysmanage.i18nManage.save
- 닫기 : button.sysmanage.i18nManage.close

### 메뉴
- Home : menu.root

### 그외
- 다국어 조회 : etc.sysmanage.i18nSearch.multiLangSearch
- 다국어 추가 : etc.sysmanage.i18nSearch.multiLangAdd
- 상세조회/수정 : etc.sysmanage.i18nSearch.detailEdit
- 선택하세요 : etc.sysmanage.i18nSearch.selectPlaceholder
- 전체 : etc.sysmanage.i18nSearch.all
- 전체 선택 : etc.sysmanage.i18nSearch.allSelect
- 다국어관리_{date}_{time}.xlsx : etc.sysmanage.i18nSearch.fileName

---

## 공통코드관리 (`CmmnCodeList`)

참고 소스:
- `frontend/src/pages/system/code/CmmnCodeList.tsx`

### 타이틀
- 공통코드관리 : title.sysmanage.commonCodeManage
- 코드정보 : title.sysmanage.commonCodeManage.codeInfo
- 코드리스트 : title.sysmanage.commonCodeManage.codeList

### 레이블
- 시스템관리 : label.sysmanage.commonCodeManage.system
- 코드정보 : label.sysmanage.commonCodeManage.codeInfo
- 상위 코드명 : label.sysmanage.commonCodeManage.parentName
- 상위 코드 : label.sysmanage.commonCodeManage.parentCode
- 업무 코드명 : label.sysmanage.commonCodeManage.bizName
- 코드 : label.sysmanage.commonCodeManage.code
- 사용여부 : label.sysmanage.commonCodeManage.useYn
- 업무 코드 설명 : label.sysmanage.commonCodeManage.bizDesc
- 코드리스트 : label.sysmanage.commonCodeManage.codeList
- 코드명 : label.sysmanage.commonCodeManage.codeName
- 코드값 : label.sysmanage.commonCodeManage.codeValue
- 순서 : label.sysmanage.commonCodeManage.sortOrder

### 플레이스홀더
- 다국어를 조회해 선택하세요 : placeholder.sysmanage.commonCodeManage.selectMultilingual

### 메시지
- 삭제할 항목을 선택하세요. : message.sysmanage.commonCodeManage.selectItemToDelete
- 이동할 항목을 하나만 선택하세요. : message.sysmanage.commonCodeManage.selectOneToMove
- 상위코드는 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.requiredParentCode
- 상위 코드명은 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.requiredParentCodeName
- 업무코드명은 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.requiredBizCodeName
- 코드는 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.requiredCode
- 코드리스트 {row}번째 행의 코드명은 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.reqRowCodeName
- 코드리스트 {row}번째 행의 코드는 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.reqRowCode
- 코드리스트 {row}번째 행의 코드값은 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.reqRowCodeValue
- 코드리스트 {row}번째 행의 사용여부는 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.reqRowUseYn
- 코드리스트 {row}번째 행의 순서는 필수 입력 항목입니다. : message.sysmanage.commonCodeManage.reqRowSort
- 코드가 성공적으로 등록되었습니다. : message.sysmanage.commonCodeManage.codeRegistered
- 코드가 성공적으로 수정되었습니다. : message.sysmanage.commonCodeManage.codeUpdated
- 저장 중 오류가 발생했습니다. : message.sysmanage.commonCodeManage.errorOnSave
- 정말로 이 코드를 삭제하시겠습니까? : message.sysmanage.commonCodeManage.confirmDeleteCode
- 하위 코드가 존재하여 삭제할 수 없습니다. : message.sysmanage.commonCodeManage.hasChildCode
- 코드가 성공적으로 삭제되었습니다. : message.sysmanage.commonCodeManage.codeDeleted
- 삭제 중 오류가 발생했습니다. : message.sysmanage.commonCodeManage.errorOnDelete
- 하위 코드 확인 중 오류가 발생했습니다. : message.sysmanage.commonCodeManage.errorCheckChild
- 데이터가 없습니다. : message.sysmanage.commonCodeManage.noData
- 회사 목록 로딩 중... : message.sysmanage.commonCodeManage.loadingCompanyList

### 버튼
- 추가 : button.sysmanage.commonCodeManage.add
- 삭제 : button.sysmanage.commonCodeManage.delete
- 저장 : button.sysmanage.commonCodeManage.save
- 조회 : button.sysmanage.commonCodeManage.search

### 메뉴
- Home : menu.root

### 그외
- 사용 : etc.sysmanage.commonCodeManage.use
- 사용안함 : etc.sysmanage.commonCodeManage.not_use
- 위로 이동 : etc.sysmanage.commonCodeManage.move_up
- 전체 선택 : etc.sysmanage.commonCodeManage.select_all
- 전체 해제 : etc.sysmanage.commonCodeManage.deselect_all
- Y : etc.sysmanage.commonCodeManage.y
- N : etc.sysmanage.commonCodeManage.n


---

## 프로그램관리 (`CmmnProgramList`, `CmmnProgramEdit`, `CmmnProgramDetail`)

참고 소스:
- `frontend/src/pages/system/program/CmmnProgramList.tsx`
- `frontend/src/pages/system/program/CmmnProgramEdit.tsx`
- `frontend/src/pages/system/program/CmmnProgramDetail.tsx`
- `frontend/src/pages/system/program/cmmnProgramI18n.ts`

### 타이틀
- 프로그램관리 : title.sysmanage.programManage
- 프로그램 등록 : title.sysmanage.programManage.programCreate
- 프로그램 상세/수정 : title.sysmanage.programManage.programDetail

### 레이블
- 시스템관리 : label.sysmanage.programManage.system
- 번호 : label.sysmanage.programManage.no
- 프로그램파일명 : label.sysmanage.programManage.fileName
- 프로그램명 : label.sysmanage.programManage.programName
- 저장 경로 : label.sysmanage.programManage.storePath
- URL : label.sysmanage.programManage.url
- 프로그램설명 : label.sysmanage.programManage.description
- 사용여부 : label.sysmanage.programManage.useYn

### 플레이스홀더
- 프로그램명/URL 검색 : placeholder.sysmanage.programManage.searchProgramNameUrl
- 프로그램파일명 : placeholder.sysmanage.programManage.programFileName
- 프로그램명 : placeholder.sysmanage.programManage.programName
- URL : placeholder.sysmanage.programManage.url

### 메시지
- 목록 조회 중 오류가 발생했습니다. : message.sysmanage.programManage.errorOnList
- 삭제할 항목을 선택해주세요. : message.sysmanage.programManage.selectItemToDelete
- 회사를 선택한 후 삭제해주세요. : message.sysmanage.programManage.selectCompanyFirst
- 선택한 항목을 삭제하시겠습니까? : message.sysmanage.programManage.confirmDelete
- 삭제 중 오류가 발생했습니다. : message.sysmanage.programManage.errorOnDelete
- 삭제되었습니다. : message.sysmanage.programManage.deleted
- 검색된 결과가 없습니다. : message.sysmanage.programManage.noSearchResult
- 회사 목록 로딩 중... : message.sysmanage.programManage.loadingCompanyList
- 조회 중 오류가 발생했습니다. : message.sysmanage.programManage.errorOnRetrieve
- 회사코드를 먼저 선택하세요. : message.sysmanage.programManage.selectCompanyBeforeLookup
- 프로그램 파일명을 입력하세요. : message.sysmanage.programManage.enterProgramFileName
- 프로그램명을 입력하세요. : message.sysmanage.programManage.enterProgramName
- 정말로 이 프로그램을 삭제하시겠습니까? : message.sysmanage.programManage.confirmDeleteProgram
- 등록 중 오류가 발생했습니다. : message.sysmanage.programManage.errorOnCreate
- 수정 중 오류가 발생했습니다. : message.sysmanage.programManage.errorOnUpdate
- 저장 중 오류가 발생했습니다. : message.sysmanage.programManage.errorOnSave
- 등록되었습니다. : message.sysmanage.programManage.registered
- 수정되었습니다. : message.sysmanage.programManage.updated

### 버튼
- 등록 : button.sysmanage.programManage.register
- 삭제 : button.sysmanage.programManage.delete
- 조회 : button.sysmanage.programManage.search
- 저장 : button.sysmanage.programManage.save
- 목록 : button.sysmanage.programManage.list

### 메뉴
- Home : menu.root

### 그외
- 사용 : etc.sysmanage.programManage.use
- 미사용 : etc.sysmanage.programManage.notUse
- 전체 선택 : etc.sysmanage.programManage.allSelect

---

## 메뉴관리 (`CmmnMenuList`)

### 타이틀
- 메뉴관리 : title.sysmanage.menuManage
- 메뉴 검색 : title.sysmanage.menuManage.menuSearch
- 프로그램명/URL 검색 : title.sysmanage.menuManage.programSearch

### 레이블
- 시스템관리 : label.sysmanage.menuManage.system
- 메뉴 No : label.sysmanage.menuManage.menuNo
- 메뉴 순서 : label.sysmanage.menuManage.menuOrder
- 상위메뉴 No : label.sysmanage.menuManage.parentMenuNo
- 메뉴명 : label.sysmanage.menuManage.menuName
- 프로그램 파일명 : label.sysmanage.menuManage.fileName
- 이미지 경로 : label.sysmanage.menuManage.imagePath
- 이미지명 : label.sysmanage.menuManage.imageName
- 사용여부 : label.sysmanage.menuManage.useYn
- 메뉴 설명 : label.sysmanage.menuManage.description
- 번호 : label.sysmanage.menuManage.no
- 프로그램파일명 : label.sysmanage.menuManage.programFile
- 프로그램명 : label.sysmanage.menuManage.programName
- URL : label.sysmanage.menuManage.url

### 플레이스홀더
- 메뉴 검색으로 선택 : placeholder.sysmanage.menuManage.selectMenuSearch
- 프로그램 파일명 검색 : placeholder.sysmanage.menuManage.searchProgramFileName
- 프로그램명/URL 검색 : placeholder.sysmanage.menuManage.searchProgramNameUrl
- 다국어를 조회해 선택하세요 : placeholder.sysmanage.menuManage.selectMultilingual

### 메시지
- 메뉴 No를 입력하세요. : message.sysmanage.menuManage.enterMenuNo
- 메뉴 순서를 입력하세요. : message.sysmanage.menuManage.enterMenuOrder
- 상위메뉴를 선택하세요. : message.sysmanage.menuManage.selectParentMenu
- 메뉴명(다국어 검색)을 선택하세요. : message.sysmanage.menuManage.selectMenuName
- 프로그램 파일명을 선택하세요. : message.sysmanage.menuManage.selectProgramFile
- 회사를 선택한 후 저장해주세요. : message.sysmanage.menuManage.selectCompanyBeforeSave
- 메뉴가 등록되었습니다. : message.sysmanage.menuManage.menuRegistered
- 등록 중 오류가 발생했습니다. : message.sysmanage.menuManage.errorOnRegister
- 메뉴가 수정되었습니다. : message.sysmanage.menuManage.menuUpdated
- 수정 중 오류가 발생했습니다. : message.sysmanage.menuManage.errorOnUpdate
- 삭제할 메뉴를 선택하세요. : message.sysmanage.menuManage.selectMenuToDelete
- 회사를 선택한 후 삭제해주세요. : message.sysmanage.menuManage.selectCompanyBeforeDelete
- 선택한 메뉴를 삭제하시겠습니까? : message.sysmanage.menuManage.confirmDeleteMenu
- 하위 메뉴가 있어 삭제할 수 없습니다. : message.sysmanage.menuManage.hasChildMenu
- 삭제 중 오류가 발생했습니다. : message.sysmanage.menuManage.errorOnDelete
- 하위 메뉴 확인 중 오류가 발생했습니다. : message.sysmanage.menuManage.errorCheckChild
- 삭제되었습니다. : message.sysmanage.menuManage.deleted
- 회사를 선택한 후 메뉴 검색을 이용해주세요. : message.sysmanage.menuManage.selectCompanySearchMenu
- 조회된 메뉴가 없습니다. : message.sysmanage.menuManage.noMenuFound
- 메뉴가 없습니다. : message.sysmanage.menuManage.noMenu
- 회사를 선택하세요. : message.sysmanage.menuManage.selectCompany
- 검색된 결과가 없습니다. : message.sysmanage.menuManage.noSearchResult
- 회사 목록 로딩 중... : message.sysmanage.menuManage.loadingCompanyList

### 버튼
- 초기화 : button.sysmanage.menuManage.reset
- 추가 : button.sysmanage.menuManage.add
- 삭제 : button.sysmanage.menuManage.delete
- 수정 : button.sysmanage.menuManage.update
- 조회 : button.sysmanage.menuManage.search
- 닫기 : button.sysmanage.menuManage.close
- 검색 : button.sysmanage.menuManage.search2

### 메뉴
- Home : menu.root

### 그외
- 메뉴 검색 : etc.sysmanage.menuManage.menuSearch
- 다국어 검색 : etc.sysmanage.menuManage.multiLangSearch
- 프로그램 파일명 검색 : etc.sysmanage.menuManage.programFileSearch
- X(닫기) : etc.sysmanage.menuManage.closeX ---------------------------------
- 전체 선택 : etc.sysmanage.menuManage.allSelect
- 사용 : etc.sysmanage.menuManage.use
- 미사용 : etc.sysmanage.menuManage.notUse
- 0/0 : etc.sysmanage.menuManage.zeroCount -------------------------

---

## 그룹관리 (`CmmnGroupList`, `CmmnGroupEdit`)

### 타이틀
- 그룹관리 : title.sysmanage.groupManage
- 그룹 등록 : title.sysmanage.groupManage.groupCreate
- 그룹 상세/수정 : title.sysmanage.groupManage.groupDetail

### 레이블
- 시스템관리 : label.sysmanage.groupManage.system
- 번호 : label.sysmanage.groupManage.no
- 회사명 : label.sysmanage.groupManage.companyName
- 그룹ID : label.sysmanage.groupManage.groupId
- 그룹명 : label.sysmanage.groupManage.groupName
- 그룹 영문명 : label.sysmanage.groupManage.groupEngName
- 그룹 설명 : label.sysmanage.groupManage.groupDesc
- 그룹설명 : label.sysmanage.groupManage.groupDesc2
- 등록일 : label.sysmanage.groupManage.regDate
- 사용 여부 : label.sysmanage.groupManage.useYn
- 사용자 목록 : label.sysmanage.groupManage.userList

### 플레이스홀더
- 그룹명/그룹ID 검색 : placeholder.sysmanage.groupManage.searchGroupNameId
- 그룹ID : placeholder.sysmanage.groupManage.groupId
- 그룹명 : placeholder.sysmanage.groupManage.groupName
- 그룹 영문명 : placeholder.sysmanage.groupManage.groupNameEn
- 그룹설명 : placeholder.sysmanage.groupManage.groupDescription
- 사용자명/사용자ID 검색 : placeholder.sysmanage.groupManage.searchUserNameId

### 메시지
- 목록 조회 중 오류가 발생했습니다. : message.sysmanage.groupManage.errorOnList
- 삭제할 항목을 선택해주세요. : message.sysmanage.groupManage.selectItemToDelete
- 선택한 그룹을 삭제하시겠습니까? : message.sysmanage.groupManage.confirmDeleteGroup
- 삭제 중 오류가 발생했습니다. : message.sysmanage.groupManage.errorOnDelete
- 삭제되었습니다. : message.sysmanage.groupManage.deleted
- 검색된 결과가 없습니다. : message.sysmanage.groupManage.noSearchResult
- 조회 중 오류가 발생했습니다. : message.sysmanage.groupManage.errorOnRetrieve
- 회사를 선택하세요. : message.sysmanage.groupManage.selectCompany
- 그룹ID를 입력하세요. : message.sysmanage.groupManage.enterGroupId
- 그룹명을 입력하세요. : message.sysmanage.groupManage.enterGroupName
- 그룹 영문명을 입력하세요. : message.sysmanage.groupManage.enterGroupNameEn
- 등록되었습니다. : message.sysmanage.groupManage.registered
- 수정되었습니다. : message.sysmanage.groupManage.updated
- 등록 중 오류가 발생했습니다. : message.sysmanage.groupManage.errorOnRegister
- 수정 중 오류가 발생했습니다. : message.sysmanage.groupManage.errorOnUpdate
- 삭제 중 오류가 발생했습니다. : message.sysmanage.groupManage.errorOnDelete

### 버튼
- 조회 : button.sysmanage.groupManage.search
- 등록 : button.sysmanage.groupManage.register
- 삭제 : button.sysmanage.groupManage.delete
- 저장 : button.sysmanage.groupManage.save
- 검색 : button.sysmanage.groupManage.search2

### 메뉴
- Home : menu.root

### 그외
- 전체 선택 : etc.sysmanage.groupManage.allSelect
- Y : etc.sysmanage.groupManage.y
- N : etc.sysmanage.groupManage.n

---

## 권한관리 (`CmmnAuthorManage`, `CmmnAuthorList`, `CmmnAuthorEdit`, `CmmnAuthorStructureTab`, `CmmnRoleTab`)

### 타이틀
- 권한관리 : title.sysmanage.authManage
- 권한 관리 (탭) : title.sysmanage.authManage.authManage
- 권한구조 (탭) : title.sysmanage.authManage.authStructure
- 롤 관리 (탭) : title.sysmanage.authManage.roleManage
- 권한 등록 : title.sysmanage.authManage.authCreate
- 권한 상세/수정 : title.sysmanage.authManage.authDetail
- 권한 구조 : title.sysmanage.authManage.authHierarchy
- 권한 리스트 : title.sysmanage.authManage.authList
- 권한 롤 정보 : title.sysmanage.authManage.authRoleInfo

### 레이블
- 시스템관리 : label.sysmanage.authManage.system
- 회사명 : label.sysmanage.authManage.companyName
- 권한코드 : label.sysmanage.authManage.authCode
- 권한명 : label.sysmanage.authManage.authName
- 권한설명 : label.sysmanage.authManage.authDesc
- 사용자 : label.sysmanage.authManage.user
- 그룹 : label.sysmanage.authManage.group
- 롤코드 : label.sysmanage.authManage.roleCode
- 롤명 : label.sysmanage.authManage.roleName
- 설명 : label.sysmanage.authManage.description
- 롤 유형 : label.sysmanage.authManage.roleType
- 롤 패턴 : label.sysmanage.authManage.rolePattern
- 롤 Sort : label.sysmanage.authManage.roleSort
- 롤 설명 : label.sysmanage.authManage.roleDesc
- 선택 : label.sysmanage.authManage.select

### 플레이스홀더
- 권한명/권한코드 검색 : placeholder.sysmanage.authManage.searchAuthNameCode
- 권한코드 : placeholder.sysmanage.authManage.authCode
- 권한명 : placeholder.sysmanage.authManage.authName
- 권한설명 : placeholder.sysmanage.authManage.authDescription
- 사용자명/사용자ID 검색 : placeholder.sysmanage.authManage.searchUserNameId
- 그룹명/그룹ID 검색 : placeholder.sysmanage.authManage.searchGroupNameId
- 롤명/롤코드 검색 : placeholder.sysmanage.authManage.searchRoleNameCode
- 권한명/권한코드 검색 (롤 탭 하단) : placeholder.sysmanage.authManage.searchAuthNameCodeRole
- 롤유형 전체 : placeholder.sysmanage.authManage.roleTypeAll

### 메시지
- 목록 조회 중 오류가 발생했습니다. : message.sysmanage.authManage.errorOnList
- 삭제할 항목을 선택해주세요. : message.sysmanage.authManage.selectItemToDelete
- 선택한 권한을 삭제하시겠습니까? (시스템 관리자 권한 AUTH_ADMIN은 삭제되지 않습니다.) : message.sysmanage.authManage.confirmDeleteAuth
- 삭제 가능한 항목이 없습니다. (AUTH_ADMIN·SYS_ADMIN은 삭제할 수 없습니다.) : message.sysmanage.authManage.noDeletableItem
- 삭제 중 오류가 발생했습니다. : message.sysmanage.authManage.errorOnDelete
- 삭제되었습니다. : message.sysmanage.authManage.deleted
- 검색된 결과가 없습니다. : message.sysmanage.authManage.noSearchResult
- 시스템 권한은 삭제할 수 없습니다. : message.sysmanage.authManage.systemAuthNotDeletable
- 선택 가능한 항목 없음 : message.sysmanage.authManage.noSelectableItem
- 조회 중 오류가 발생했습니다. : message.sysmanage.authManage.errorOnRetrieve
- 회사를 선택하세요. : message.sysmanage.authManage.selectCompany
- 권한코드를 입력하세요. : message.sysmanage.authManage.enterAuthCode
- 권한명을 입력하세요. : message.sysmanage.authManage.enterAuthName
- 등록되었습니다. : message.sysmanage.authManage.registered
- 수정되었습니다. : message.sysmanage.authManage.updated
- 등록 중 오류가 발생했습니다. : message.sysmanage.authManage.errorOnRegister
- 수정 중 오류가 발생했습니다. : message.sysmanage.authManage.errorOnUpdate
- 시스템 관리자 권한(AUTH_ADMIN)은 삭제할 수 없습니다. : message.sysmanage.authManage.adminNotDeletable
- 저장 중 오류가 발생했습니다. : message.sysmanage.authManage.errorOnSave
- 롤코드와 롤명은 필수입니다. : message.sysmanage.authManage.roleRequired
- 롤 유형을 선택하세요. : message.sysmanage.authManage.selectRoleType
- 삭제하시겠습니까? : message.sysmanage.authManage.confirmDelete
- 삭제할 항목을 선택하세요. : message.sysmanage.authManage.selectItemToDelete1
- 선택한 롤을 삭제하시겠습니까? : message.sysmanage.authManage.confirmDeleteRole
- 권한을 선택하세요. : message.sysmanage.authManage.selectAuth
- 롤이 없습니다. : message.sysmanage.authManage.noRole

### 버튼
- 조회 : button.sysmanage.authManage.search
- 등록 : button.sysmanage.authManage.register
- 삭제 : button.sysmanage.authManage.delete
- 저장 : button.sysmanage.authManage.save
- 검색 : button.sysmanage.authManage.search2
- 초기화 : button.sysmanage.authManage.reset

### 메뉴
- Home : menu.root

### 그외
- 삭제 가능한 항목만 전체 선택 (AUTH_ADMIN 제외) : etc.sysmanage.authManage.selectDeletableExceptAdmin
- 전체 : etc.sysmanage.authManage.all
- 선택 : etc.sysmanage.authManage.select
- 전체 선택 (aria-label) : etc.sysmanage.authManage.selectAllAriaLabel --------------------------

---

## 회사정보관리 (`CmmnCompanyList`, `CmmnCompanyEdit`)

### 타이틀
- 회사정보관리 : title.sysmanage.companyInfoManage
- 회사정보 등록 : title.sysmanage.companyInfoManage.companyCreate
- 회사정보 상세/수정 : title.sysmanage.companyInfoManage.companyDetail

### 레이블
- 시스템관리 : label.sysmanage.companyInfoManage.system
- 번호 : label.sysmanage.companyInfoManage.no
- 회사명 : label.sysmanage.companyInfoManage.companyName
- 회사 ID : label.sysmanage.companyInfoManage.companyId
- 신청자 이름 : label.sysmanage.companyInfoManage.applicantName
- 신청자 이메일 : label.sysmanage.companyInfoManage.applicantEmail
- 전화번호 : label.sysmanage.companyInfoManage.phoneNumber
- 만기일 : label.sysmanage.companyInfoManage.expireDate
- 등록일 : label.sysmanage.companyInfoManage.regDate
- 가입상태 : label.sysmanage.companyInfoManage.joinStatus

### 플레이스홀더
- 회사ID/회사명 검색 : placeholder.sysmanage.companyInfoManage.searchCompanyIdName
- 회사 ID : placeholder.sysmanage.companyInfoManage.companyId
- 회사명 : placeholder.sysmanage.companyInfoManage.companyName

### 메시지
- 목록 조회 중 오류가 발생했습니다. : message.sysmanage.companyInfoManage.errorOnList
- 삭제할 항목을 선택해주세요. : message.sysmanage.companyInfoManage.selectItemToDelete
- 선택한 회사정보를 삭제(상태 변경) 하시겠습니까? : message.sysmanage.companyInfoManage.confirmDeleteCompany
- 삭제 중 오류가 발생했습니다. : message.sysmanage.companyInfoManage.errorOnDelete
- 삭제되었습니다. : message.sysmanage.companyInfoManage.deleted
- 검색된 결과가 없습니다. : message.sysmanage.companyInfoManage.noSearchResult
- 조회 중 오류가 발생했습니다. : message.sysmanage.companyInfoManage.errorOnRetrieve
- 저장 중 오류가 발생했습니다. : message.sysmanage.companyInfoManage.errorOnSave
- 등록되었습니다. : message.sysmanage.companyInfoManage.registered
- 수정되었습니다. : message.sysmanage.companyInfoManage.updated

### 버튼
- 조회 : button.sysmanage.companyInfoManage.search
- 등록 : button.sysmanage.companyInfoManage.register
- 삭제 : button.sysmanage.companyInfoManage.delete
- 저장 : button.sysmanage.companyInfoManage.save
- 목록 : button.sysmanage.companyInfoManage.list

### 메뉴
- Home : menu.root

### 그외
- 전체 : etc.sysmanage.companyInfoManage.all
- 전체 선택 : etc.sysmanage.companyInfoManage.allSelect


---

## 사용자관리 (`UserList`)

### 타이틀
- 사용자관리 : title.sysmanage.userManage
- 사용자 관리 : title.sysmanage.userManage.userManage
- 부서 관리 : title.sysmanage.userManage.deptManage
- 사용자 기본 정보 : title.sysmanage.userManage.userBasicInfo
- 회사별 정보 : title.sysmanage.userManage.companyInfo
- 부서 리스트 : title.sysmanage.userManage.deptList
- 부서 정보 : title.sysmanage.userManage.deptInfo
- 회사 사용자 리스트 : title.sysmanage.userManage.companyUserList
- 부서 사용자 리스트 : title.sysmanage.userManage.deptUserList
- 부서장 선택 : title.sysmanage.userManage.deptHeadSelect

### 레이블
- 시스템관리 : label.sysmanage.userManage.system
- 사용자 관리 : label.sysmanage.userManage.userManage
- 부서 관리 : label.sysmanage.userManage.deptManage
- 사용자 기본 정보 : label.sysmanage.userManage.userBasicInfo
- 회사별 정보 : label.sysmanage.userManage.companyInfo
- 부서 리스트 : label.sysmanage.userManage.deptList
- 부서 정보 : label.sysmanage.userManage.deptInfo
- 회사 사용자 리스트 : label.sysmanage.userManage.companyUserList
- 부서 사용자 리스트 : label.sysmanage.userManage.deptUserList
- 사용자ID : label.sysmanage.userManage.userId
- 사용자명 : label.sysmanage.userManage.userName
- 사용자영문명 : label.sysmanage.userManage.userEngName
- 성별 구분 : label.sysmanage.userManage.gender
- 생일 : label.sysmanage.userManage.birthDate
- 우편번호 : label.sysmanage.userManage.zipCode
- 도시 : label.sysmanage.userManage.city
- 주소 1 : label.sysmanage.userManage.address1
- 주소 2 : label.sysmanage.userManage.address2
- 주/도/광역시 : label.sysmanage.userManage.state
- 국가 : label.sysmanage.userManage.country
- 전화번호 : label.sysmanage.userManage.phone
- 이동전화번호 : label.sysmanage.userManage.mobile
- 팩스번호 : label.sysmanage.userManage.fax
- 이메일 : label.sysmanage.userManage.email
- 비밀번호 : label.sysmanage.userManage.password
- 비밀번호 확인 : label.sysmanage.userManage.passwordConfirm
- 비밀번호 힌트 : label.sysmanage.userManage.passwordHint
- 비밀번호 답변 : label.sysmanage.userManage.passwordAnswer
- 프로필 사진 : label.sysmanage.userManage.profileImage
- 사원번호 : label.sysmanage.userManage.employeeNo
- 직위 : label.sysmanage.userManage.position
- 입사일 : label.sysmanage.userManage.hireDate
- 퇴사일 : label.sysmanage.userManage.leaveDate
- 부서명 : label.sysmanage.userManage.deptName
- 부서 코드 : label.sysmanage.userManage.deptCode
- 상위부서 코드 : label.sysmanage.userManage.parentDeptCode
- 상위부서명 : label.sysmanage.userManage.parentDeptName
- 부서 등급 : label.sysmanage.userManage.deptLevel
- 부서장명 : label.sysmanage.userManage.deptHeadName
- 만기일 : label.sysmanage.userManage.expireDate
- 순서 : label.sysmanage.userManage.sortOrder
- 사용여부 : label.sysmanage.userManage.useYn
- 번호 : label.sysmanage.userManage.no

### 플레이스홀더
- 사용자ID/사용자명 검색 : placeholder.sysmanage.userManage.searchUserIdName
- 빈값이면 현재 비밀번호 유지 : placeholder.sysmanage.userManage.keepPasswordIfEmpty
- 우편번호 : placeholder.sysmanage.userManage.zipCode
- KR : placeholder.sysmanage.userManage.countryKr
- 부서 검색으로 선택 : placeholder.sysmanage.userManage.selectDeptSearch
- 다국어를 조회해 선택하세요 : placeholder.sysmanage.userManage.selectMultilingual
- 사용자명/사용자ID 검색 : placeholder.sysmanage.userManage.searchUserNameId
- 조회 버튼을 눌러 회사 사용자 목록을 불러오세요. : placeholder.sysmanage.userManage.loadCompanyUsers

### 메시지
- 사용자ID를 입력해 주세요. : message.sysmanage.userManage.enterUserId
- 사용 가능한 아이디입니다. : message.sysmanage.userManage.availableId
- 사용하실 수 없는 아이디입니다. : message.sysmanage.userManage.unavailableId
- 중복 아이디 검색을 해주십시오. : message.sysmanage.userManage.checkDuplicateId
- 비밀번호를 입력해 주세요. : message.sysmanage.userManage.enterPassword
- 비밀번호와 비밀번호 확인이 일치하지 않습니다. : message.sysmanage.userManage.passwordMismatch
- 사용자명을 입력해 주세요. : message.sysmanage.userManage.enterUserName
- 사용자영문명을 입력해 주세요. : message.sysmanage.userManage.enterUserEngName
- 회사별 정보에서 부서를 선택하세요. : message.sysmanage.userManage.selectDeptInCompany
- 저장되었습니다. : message.sysmanage.userManage.saved
- 저장 중 오류가 발생했습니다. : message.sysmanage.userManage.errorOnSave
- 등록되었습니다. : message.sysmanage.userManage.registered
- 등록 중 오류가 발생했습니다. : message.sysmanage.userManage.errorOnRegister
- 삭제할 사용자를 선택해 주세요. : message.sysmanage.userManage.selectUserToDelete
- 선택한 사용자를 삭제하시겠습니까? : message.sysmanage.userManage.confirmDeleteUser
- 삭제되었습니다. : message.sysmanage.userManage.deleted
- 삭제 중 오류가 발생했습니다. : message.sysmanage.userManage.errorOnDelete
- 삭제할 항목을 선택해 주세요. : message.sysmanage.userManage.selectItemToDelete
- 삭제에 실패했습니다. : message.sysmanage.userManage.deleteFailed
- 일부만 삭제되었습니다. (성공 {count}명 / {total}명) : message.sysmanage.userManage.partialDeleted
- 삭제에 실패했습니다. 네트워크 또는 권한을 확인하세요. : message.sysmanage.userManage.deleteFailedCheck
- 이미지 파일만 등록할 수 있습니다. : message.sysmanage.userManage.onlyImageAllowed
- 파일 크기는 {filesize}MB 이하여야 합니다. : message.sysmanage.userManage.fileSizeLimit  ---------------------------------------------------------------
- 이미지 업로드에 실패했습니다. : message.sysmanage.userManage.imageUploadFailed
- 회사를 선택해 주세요. : message.sysmanage.userManage.selectCompany
- 회사를 선택하세요. : message.sysmanage.userManage.selectCompanyReq
- 회사를 선택하고 부서 정보를 입력하세요. : message.sysmanage.userManage.selectCompanyAndDept
- 상위부서 코드를 선택하세요. : message.sysmanage.userManage.selectParentDeptCode
- 상위부서명을 선택하세요. : message.sysmanage.userManage.selectParentDeptName
- 부서 코드를 입력하세요. : message.sysmanage.userManage.enterDeptCode
- 부서명은 다국어 조회를 통해 선택하세요. : message.sysmanage.userManage.selectDeptNameMulti
- 부서를 선택한 뒤 저장하세요. : message.sysmanage.userManage.saveAfterSelectDept
- 신규 입력 중에는 삭제할 수 없습니다. 먼저 초기화 후 부서를 선택하세요. : message.sysmanage.userManage.noDeleteDuringNew
- 삭제할 부서를 선택하세요. : message.sysmanage.userManage.selectDeptToDelete
- 선택한 부서를 삭제(비활성)하시겠습니까? : message.sysmanage.userManage.confirmDeleteDept
- 하위 부서 또는 소속 사용자가 있으면 삭제할 수 없습니다. : message.sysmanage.userManage.cannotDeleteDeptWithChildren
- 부서에서 제거할 사용자를 선택하세요. : message.sysmanage.userManage.selectUserToRemove
- 해당 부서에 사용자가 없습니다. : message.sysmanage.userManage.noUsersInDept
- 부서를 선택하세요. : message.sysmanage.userManage.selectDept
- 부서를 먼저 선택하세요. : message.sysmanage.userManage.selectDeptFirst
- 추가할 사용자를 선택하세요. : message.sysmanage.userManage.selectUserToAdd
- 부서에서 제거하지 못했습니다. 네트워크 또는 권한을 확인하세요. : message.sysmanage.userManage.removeUserFailed
- 일부만 제거되었습니다. (성공 {count}명 / {total}명) : message.sysmanage.userManage.partialRemoved
- 부서가 없습니다. : message.sysmanage.userManage.noDepartment
- 회사를 선택한 뒤 부서 트리가 조회됩니다. : message.sysmanage.userManage.loadDeptTreeAfterCompany
- 검색된 결과가 없습니다. : message.sysmanage.userManage.noSearchResult

### 버튼
- 조회 : button.sysmanage.userManage.search
- 등록 : button.sysmanage.userManage.register
- 삭제 : button.sysmanage.userManage.delete
- 저장 : button.sysmanage.userManage.save
- 초기화 : button.sysmanage.userManage.reset
- 회사정보관리 이동 : button.sysmanage.userManage.moveCompanyInfo
- 중복 아이디 검색 : button.sysmanage.userManage.checkDuplicateId
- 사진 선택 : button.sysmanage.userManage.selectPhoto
- 사진 삭제 : button.sysmanage.userManage.deletePhoto
- Q (부서 검색) : button.sysmanage.userManage.searchDept ----------
- 검색 : button.sysmanage.userManage.search2

### 메뉴
- Home : menu.root

### 그외
- 선택 : etc.sysmanage.userManage.select
- 사용 : etc.sysmanage.userManage.use
- 사용안함 : etc.sysmanage.userManage.notUse
- 업로드 중… : etc.sysmanage.userManage.uploading
- 전체 선택 : etc.sysmanage.userManage.allSelect
- 부서장 선택 : etc.sysmanage.userManage.selectDeptHead
- X(닫기) : etc.sysmanage.userManage.closeX -----------------------

---

## 위젯데이터셋관리 (`WidgetDataSetList`)

### 타이틀
- 위젯데이터셋관리 : title.sysmanage.widgetDatasetManage
- 데이터 셋 리스트 : title.sysmanage.widgetDatasetManage.datasetList
- 데이터 셋 정보 : title.sysmanage.widgetDatasetManage.datasetInfo
- 데이터 미리보기 : title.sysmanage.widgetDatasetManage.datasetPreview

### 레이블
- 사이트관리 : label.sysmanage.widgetDatasetManage.siteManage
- 유형 : label.sysmanage.widgetDatasetManage.type
- 데이터명 : label.sysmanage.widgetDatasetManage.dataName
- 데이터 ID : label.sysmanage.widgetDatasetManage.dataId
- 데이터 유형 : label.sysmanage.widgetDatasetManage.dataType
- 사용여부 : label.sysmanage.widgetDatasetManage.useYn
- 수정일 : label.sysmanage.widgetDatasetManage.updateDate

### 플레이스홀더
- 데이터명 검색 : placeholder.sysmanage.widgetDatasetManage.searchDataName
- SELECT ... (SELECT 만 허용) : placeholder.sysmanage.widgetDatasetManage.selectOnlyQuery
- configList 등 (JSON). 예: { "configList": [...] } : placeholder.sysmanage.widgetDatasetManage.configListJson
- Config에 :authkey 로 두었을 때 여기 입력한 값으로 치환됩니다. : placeholder.sysmanage.widgetDatasetManage.configAuthReplace
- { "url": "https://...", "method": "GET", "headers": {}, "params": { "key": "값 또는 :이름" } } : placeholder.sysmanage.widgetDatasetManage.apiConfigExample
- { "items": [ { "title": "...", "date": "..." } ] } : placeholder.sysmanage.widgetDatasetManage.itemsJsonExample

### 메시지
- 상세 조회 중 오류가 발생했습니다. : message.sysmanage.widgetDatasetManage.errorOnDetail
- 회사를 선택하세요. : message.sysmanage.widgetDatasetManage.selectCompany
- 데이터셋 ID 채번에 실패했습니다. : message.sysmanage.widgetDatasetManage.failGenerateId
- Config(JSON) 형식이 올바르지 않습니다. : message.sysmanage.widgetDatasetManage.invalidConfigJson
- 설정 JSON 형식이 올바르지 않습니다. : message.sysmanage.widgetDatasetManage.invalidSettingJson
- 복사할 데이터명이 없습니다. : message.sysmanage.widgetDatasetManage.noDataNameToCopy
- 데이터셋명은 1~{max}자 이내여야 합니다. : message.sysmanage.widgetDatasetManage.datasetNameLength
- 데이터 유형을 선택하세요. : message.sysmanage.widgetDatasetManage.selectDataType
- 데이터셋 ID는 1~{max}자 이내여야 합니다. : message.sysmanage.widgetDatasetManage.datasetIdLength
- 저장되었습니다. : message.sysmanage.widgetDatasetManage.saved
- 수정되었습니다. : message.sysmanage.widgetDatasetManage.updated
- 저장 중 오류가 발생했습니다. : message.sysmanage.widgetDatasetManage.errorOnSave
- 수정 중 오류가 발생했습니다. : message.sysmanage.widgetDatasetManage.errorOnUpdate
- 선택한 데이터셋을 삭제하시겠습니까? : message.sysmanage.widgetDatasetManage.confirmDeleteDataset
- 삭제되었습니다. : message.sysmanage.widgetDatasetManage.deleted
- 삭제 중 오류가 발생했습니다. : message.sysmanage.widgetDatasetManage.errorOnDelete
- 미리보기 요청 중 오류가 발생했습니다. : message.sysmanage.widgetDatasetManage.errorOnPreviewRequest
- 조회 결과가 없습니다. : message.sysmanage.widgetDatasetManage.noQueryResult
- 미리보기 결과가 없습니다. : message.sysmanage.widgetDatasetManage.noPreviewResult

### 버튼
- 초기화 : button.sysmanage.widgetDatasetManage.reset
- 복사 : button.sysmanage.widgetDatasetManage.copy
- 삭제 : button.sysmanage.widgetDatasetManage.delete
- 저장 : button.sysmanage.widgetDatasetManage.save
- 조회 : button.sysmanage.widgetDatasetManage.search
- 미리보기 : button.sysmanage.widgetDatasetManage.preview

### 메뉴
- Home : menu.root

### 그외
- 전체 : etc.sysmanage.widgetDatasetManage.all
- 사용 : etc.sysmanage.widgetDatasetManage.use
- 사용안함 : etc.sysmanage.widgetDatasetManage.notUse
- Query : etc.sysmanage.widgetDatasetManage.query
- Config : etc.sysmanage.widgetDatasetManage.config
- DATA (JSON) : etc.sysmanage.widgetDatasetManage.dataJson

---

## 위젯스타일관리 (`WidgetStyleList`)

### 타이틀
- 위젯 스타일 관리 : title.sysmanage.widgetStyleManage
- 스타일 리스트 : title.sysmanage.widgetStyleManage.styleList
- 스타일 정보 : title.sysmanage.widgetStyleManage.styleInfo
- 스타일 미리보기 : title.sysmanage.widgetStyleManage.stylePreview

### 레이블
- 사이트관리 : label.sysmanage.widgetStyleManage.siteManage
- 스타일 유형 : label.sysmanage.widgetStyleManage.styleType
- 스타일명 : label.sysmanage.widgetStyleManage.styleName
- 스타일 ID : label.sysmanage.widgetStyleManage.styleId
- 사용여부 : label.sysmanage.widgetStyleManage.useYn
- 수정일 : label.sysmanage.widgetStyleManage.updateDate
- 배경 : label.sysmanage.widgetStyleManage.background
- 테두리 : label.sysmanage.widgetStyleManage.border
- 제목 : label.sysmanage.widgetStyleManage.title
- 테두리 두께(px) : label.sysmanage.widgetStyleManage.borderWidth
- 모서리 반경(px) : label.sysmanage.widgetStyleManage.borderRadius
- 그림자 : label.sysmanage.widgetStyleManage.boxShadow
- 헤더 : label.sysmanage.widgetStyleManage.header
- 헤더배경 : label.sysmanage.widgetStyleManage.headerBackground
- 헤더 높이(px) : label.sysmanage.widgetStyleManage.headerHeight

### 플레이스홀더
- 스타일명 검색 : placeholder.sysmanage.widgetStyleManage.searchStyleName

### 메시지
- 상세 조회 중 오류가 발생했습니다. : message.sysmanage.widgetStyleManage.errorOnDetail
- 회사를 선택하세요. : message.sysmanage.widgetStyleManage.selectCompany
- 스타일 ID 채번에 실패했습니다. : message.sysmanage.widgetStyleManage.failGenerateStyleId
- 복사할 스타일명이 없습니다. : message.sysmanage.widgetStyleManage.noStyleNameToCopy
- 스타일명, 스타일 ID, 스타일 유형은 필수입니다. : message.sysmanage.widgetStyleManage.requiredFields
- 저장되었습니다. : message.sysmanage.widgetStyleManage.saved
- 수정되었습니다. : message.sysmanage.widgetStyleManage.updated
- 저장 중 오류가 발생했습니다. : message.sysmanage.widgetStyleManage.errorOnSave
- 수정 중 오류가 발생했습니다. : message.sysmanage.widgetStyleManage.errorOnUpdate
- 선택한 스타일을 삭제하시겠습니까? : message.sysmanage.widgetStyleManage.confirmDeleteStyle
- 삭제되었습니다. : message.sysmanage.widgetStyleManage.deleted
- 삭제 중 오류가 발생했습니다. : message.sysmanage.widgetStyleManage.errorOnDelete
- 조회 결과가 없습니다. : message.sysmanage.widgetStyleManage.noQueryResult
- 스타일을 선택하면 미리보기가 표시됩니다. : message.sysmanage.widgetStyleManage.previewOnSelect
- 신규 등록은 DB에 저장된 스타일이 없어 미리보기를 표시하지 않습니다. : message.sysmanage.widgetStyleManage.noPreviewForNew
- 저장 후 목록에서 해당 스타일을 선택하면 DB 내용이 반영된 미리보기를 볼 수 있습니다. : message.sysmanage.widgetStyleManage.previewAfterSave

### 버튼
- 초기화 : button.sysmanage.widgetStyleManage.reset
- 복사 : button.sysmanage.widgetStyleManage.copy
- 삭제 : button.sysmanage.widgetStyleManage.delete
- 저장 : button.sysmanage.widgetStyleManage.save
- 조회 : button.sysmanage.widgetStyleManage.search
- >> 상세 스타일 : sysmanage.widgetStyleManage.toDetailStyle
- << 기본 스타일 : button.sysmanage.widgetStyleManage.toDefaultStyle
- 미리보기 : button.sysmanage.widgetStyleManage.preview
- HTML : button.sysmanage.widgetStyleManage.html
- CSS : button.sysmanage.widgetStyleManage.css
- JS : button.sysmanage.widgetStyleManage.js

### 메뉴
- Home : menu.root

### 그외
- 전체 : etc.sysmanage.widgetStyleManage.all
- 사용 : etc.sysmanage.widgetStyleManage.use
- 사용안함 : etc.sysmanage.widgetStyleManage.notUse
- 코드 로딩 중 : etc.sysmanage.widgetStyleManage.codeLoading
- 위젯 스타일 미리보기 : etc.sysmanage.widgetStyleManage.preview

---

## 위젯관리 (`WidgetList`, `WidgetAuthorAuthPanel`)

### 타이틀
- 위젯 관리 : title.sysmanage.widgetManage
- 위젯 리스트 : title.sysmanage.widgetManage.widgetList
- 위젯 정보 : title.sysmanage.widgetManage.widgetInfo
- 스타일 미리보기 : title.sysmanage.widgetManage.stylePreview
- 최종 화면 미리보기 : title.sysmanage.widgetManage.finalPreview
- 권한 구조 관계 : title.sysmanage.widgetManage.authRelation
- 권한정보 : title.sysmanage.widgetManage.authInfo

### 레이블
- 사이트관리 : label.sysmanage.widgetManage.siteManage
- 위젯명 : label.sysmanage.widgetManage.widgetName
- 데이터 : label.sysmanage.widgetManage.data
- 스타일 : label.sysmanage.widgetManage.style
- 사용 : label.sysmanage.widgetManage.useYn
- 데이터 미리보기 (드래그 소스) : label.sysmanage.widgetManage.dataPreview
- 스타일 핸들바 매핑 (드롭 대상) : label.sysmanage.widgetManage.styleHandleMapping
- 매핑 JSON : label.sysmanage.widgetManage.mappingJson
- 설정 JSON : label.sysmanage.widgetManage.configJson
- 토큰별 다국어 매핑(드롭 대상) : label.sysmanage.widgetManage.tokenI18nMapping
- 연결된 다국어 : label.sysmanage.widgetManage.linkedI18n
- 다국어 조회 : label.sysmanage.widgetManage.i18nSearch
- 권한코드 : label.sysmanage.widgetManage.authCode
- 권한명 : label.sysmanage.widgetManage.authName
- 설명 : label.sysmanage.widgetManage.description

### 플레이스홀더
- 검색 : placeholder.sysmanage.widgetManage.search
- 이미지 선택 시 표시 : placeholder.sysmanage.widgetManage.displayOnImageSelect
- 돋보기를 눌러 다국어 메시지를 선택하세요 : placeholder.sysmanage.widgetManage.selectMultilingualMessage

### 메시지
- 상세 조회 중 오류가 발생했습니다. : message.sysmanage.widgetManage.errorOnDetail
- 이미지 업로드 중 오류가 발생했습니다. : message.sysmanage.widgetManage.errorOnImageUpload
- 회사를 선택하세요. : message.sysmanage.widgetManage.selectCompany
- 위젯 ID 채번에 실패했습니다. : message.sysmanage.widgetManage.failGenerateWidgetId
- 복사할 위젯명이 없습니다. : message.sysmanage.widgetManage.noWidgetNameToCopy
- 위젯 ID를 발급 중입니다. 잠시 후 다시 저장해 주세요. : message.sysmanage.widgetManage.widgetIdPending
- 매핑 JSON 형식이 올바르지 않습니다. : message.sysmanage.widgetManage.invalidMappingJson
- 설정 JSON 형식이 올바르지 않습니다. : message.sysmanage.widgetManage.invalidConfigJson
- 저장되었습니다. : message.sysmanage.widgetManage.saved
- 수정되었습니다. : message.sysmanage.widgetManage.updated
- 저장 중 오류가 발생했습니다. : message.sysmanage.widgetManage.errorOnSave
- 수정 중 오류가 발생했습니다. : message.sysmanage.widgetManage.errorOnUpdate
- 삭제되었습니다. : message.sysmanage.widgetManage.deleted
- 삭제 중 오류가 발생했습니다. : message.sysmanage.widgetManage.errorOnDelete
- 조회 결과가 없습니다. : message.sysmanage.widgetManage.noQueryResult
- 데이터셋을 선택하면 샘플 데이터가 표시됩니다. : message.sysmanage.widgetManage.selectDatasetForPreview
- 스타일 템플릿에 매핑 가능한 핸들바가 없습니다. : message.sysmanage.widgetManage.noHandlebarsInStyleTemplate
- 아직 연결된 다국어가 없습니다. : message.sysmanage.widgetManage.noMultilingualLinked
- 회사를 선택하면 권한 구조와 권한정보를 설정할 수 있습니다. : message.sysmanage.widgetManage.permissionStructure
- 표시할 권한 구조가 없습니다. : message.sysmanage.widgetManage.noPermissionStructure
- 권한관리 > 권한구조에서 관계를 등록한 뒤, 노드를 이 영역으로 드래그해 아래 권한정보에 넣을 수 있습니다. : message.sysmanage.widgetManage.dragPermissionNodeHint
- 노드를 권한정보 영역으로 드래그하면 위젯에 해당 권한이 추가됩니다. 저장 시 CM_WIDGET_AUTHOR에 반영됩니다. : message.sysmanage.widgetManage.dragNodeToPermissionInfo
- 상단 권한 구조에서 노드를 드래그하여 여기에 놓으세요. : message.sysmanage.widgetManage.dragFromTopPermission
- 선택한 위젯을 삭제하시겠습니까? : etc.sysmanage.widgetManage.confirmDeleteWidget
- 다음 항목은 필수입니다. : etc.sysmanage.widgetManage.requiredFieldsIntro
- 데이터셋 정보를 찾을 수 없습니다. : etc.sysmanage.widgetManage.datasetNotFound
- 데이터 미리보기 요청 중 오류가 발생했습니다. : etc.sysmanage.widgetManage.datasetPreviewError
- 데이터셋 상세 조회 중 오류가 발생했습니다. : etc.sysmanage.widgetManage.datasetDetailError
- 위젯명은 {max}자 이하여야 합니다. : etc.sysmanage.widgetManage.widgetNameMax
- 위젯 ID는 {max}자 이하여야 합니다. : etc.sysmanage.widgetManage.widgetIdMax
- 파일번호 입력은 {max}자 이하여야 합니다. : etc.sysmanage.widgetManage.fileSqMax
- 이미지 업로드에 실패했습니다. : etc.sysmanage.widgetManage.imageUploadFailed

### 버튼
- 조회 : button.sysmanage.widgetManage.search
- 저장 : button.sysmanage.widgetManage.save
- 삭제 : button.sysmanage.widgetManage.delete
- 이 권한 제거 ({title}) : button.sysmanage.widgetManage.removePermission
- 초기화 : etc.sysmanage.widgetManage.btnReset
- 복사 : etc.sysmanage.widgetManage.btnCopy
- 이미지 선택 : etc.sysmanage.widgetManage.btnSelectImage
- 사진삭제 : etc.sysmanage.widgetManage.btnDeletePhoto
- 선택 해제 : etc.sysmanage.widgetManage.btnClearI18nSelection
- 메시지 선택 해제 : etc.sysmanage.widgetManage.btnClearI18nMessage

### 메뉴
- Home : menu.root

### 레이블 (`etc.sysmanage.widgetManage.*` — 화면 전용)
- 카테고리 : etc.sysmanage.widgetManage.labelCategory
- 위젯사진 : etc.sysmanage.widgetManage.labelWidgetPhoto
- 데이터유형 : etc.sysmanage.widgetManage.labelDataTy
- 스타일유형 : etc.sysmanage.widgetManage.labelStyleTy
- 스타일명 : etc.sysmanage.widgetManage.labelStyleNameField
- 위젯 ID : etc.sysmanage.widgetManage.labelWidgetId
- 카테고리 (필수 안내 등) : etc.sysmanage.widgetManage.labelFieldCategory
- 데이터명 (필수 안내 등) : etc.sysmanage.widgetManage.labelFieldDatasetName
- 스타일명 (필수 안내 등) : etc.sysmanage.widgetManage.labelFieldStyleName

### 그외
- 전체 : etc.sysmanage.widgetManage.all
- 선택 : etc.sysmanage.widgetManage.select
- 코드 로딩 중 : etc.sysmanage.widgetManage.codeLoading
- 드래그 : etc.sysmanage.widgetManage.drag
- edges / nodes (디버그 표시) : etc.sysmanage.widgetManage.edgesNodesDebug
- 사용 (목록 컬럼·라디오) : etc.sysmanage.widgetManage.columnUse
- 복사 접미사 (위젯명) : etc.sysmanage.widgetManage.copyNameSuffix
- 매핑 : etc.sysmanage.widgetManage.tabMapping
- 다국어 : etc.sysmanage.widgetManage.tabI18n
- 권한 : etc.sysmanage.widgetManage.tabAuth
- 설정확인 : etc.sysmanage.widgetManage.tabCheck
- 위젯 상세 탭 : etc.sysmanage.widgetManage.widgetDetailTabsAria
- WIDGET- + 시퀀스로 자동 채번됩니다. : etc.sysmanage.widgetManage.widgetIdAutoTitle
- 업로드 중… : etc.sysmanage.widgetManage.uploading
- 위젯 사진 미리보기 : etc.sysmanage.widgetManage.altWidgetPhotoPreview
- 스타일 미리보기 placeholder(본문) : etc.sysmanage.widgetManage.stylePreviewIdleBody
- 미리보기 토큰: 제목 : etc.sysmanage.widgetManage.previewTokenTitle
- 미리보기 토큰: 값 : etc.sysmanage.widgetManage.previewTokenValue
- 미리보기 토큰: 데이터 : etc.sysmanage.widgetManage.previewTokenData
- → (미지정) : etc.sysmanage.widgetManage.unmappedMapping
- 드래그해서 스타일 필드에 놓으세요 : etc.sysmanage.widgetManage.dragColToStyleField
- 여기에 데이터 컬럼명을 드롭 : etc.sysmanage.widgetManage.dropDataColumnOnToken
- 매핑 해제 : etc.sysmanage.widgetManage.clearMappingTitle
- JS 템플릿에만 존재하는 토큰 : etc.sysmanage.widgetManage.jsOnlyTokenTitle
- 매핑 JSON 안내(dataList/langList) : etc.sysmanage.widgetManage.mappingJsonHint
- iframe: 위젯 스타일 미리보기 : etc.sysmanage.widgetManage.iframeStylePreview
- iframe: 다국어 탭 스타일 미리보기 : etc.sysmanage.widgetManage.iframeI18nStylePreview
- iframe: 최종 위젯 미리보기 : etc.sysmanage.widgetManage.iframeFinalPreview
- 미리보기에서 치환 문구를 마우스로 선택(또는 클릭)하세요. : etc.sysmanage.widgetManage.i18nSelectInstruction
- 선택: : etc.sysmanage.widgetManage.i18nSelectedLine
- · 부분 문구: : etc.sysmanage.widgetManage.i18nPhrasePart
- 데이터 컬럼에 아직 매핑되지 않은 토큰이 없습니다. : etc.sysmanage.widgetManage.noUnmappedTokens
- 다국어 칩을 여기에 드롭 : etc.sysmanage.widgetManage.dropLangChipTitle
- 미리보기에서 문구를 마우스로 선택한 뒤, 그 문구 위 또는 파란 영역에 드롭 : etc.sysmanage.widgetManage.titleI18nDragChip
- 다국어 검색 : etc.sysmanage.widgetManage.titleI18nLookup
- 다국어 검색 : etc.sysmanage.widgetManage.ariaI18nLookup
- 데이터 컬럼 {column} · 미리보기에서 선택한 부분 문구 : etc.sysmanage.widgetManage.langChipRowTitlePhrase
- 데이터 컬럼 {column} 전체 : etc.sysmanage.widgetManage.langChipRowTitleColumn
- {column} (전체) : etc.sysmanage.widgetManage.langChipWholeColumn
- 이 줄 매핑 해제 : etc.sysmanage.widgetManage.ariaClearRowMapping
- 매핑 해제 : etc.sysmanage.widgetManage.titleClearRowMapping
- {code} 제거 : etc.sysmanage.widgetManage.ariaRemoveAuthor
- edges: {edgeCount} / nodes: {nodeCount} : etc.sysmanage.widgetManage.flowEdgeNodeCounts
- 사용안함 : etc.sysmanage.widgetManage.useYnNo
-  → 컬럼 (다국어 탭 선택 줄) : etc.sysmanage.widgetManage.i18nColumnLead

---

## 게시판관리 (`BbsList`)

### 타이틀
- 게시판 관리 : title.sysmanage.bbsManage
- 게시판 리스트 : title.sysmanage.bbsManage.bbsList
- 게시판 : title.sysmanage.bbsManage.bbs
- 팝업공지 : title.sysmanage.bbsManage.popupNotice
- 팝업공지 설정 : title.sysmanage.bbsManage.popupNoticeSetting
- 권한관리 : title.sysmanage.bbsManage.authManage
- 기본설정 : title.sysmanage.bbsManage.basicSetting
- 휴지통 : title.sysmanage.bbsManage.trash
- 댓글승인 : title.sysmanage.bbsManage.commentApproval

### 레이블
- 사이트관리 : label.sysmanage.bbsManage.siteManage
- 회사 : label.sysmanage.bbsManage.company
- 유형 : label.sysmanage.bbsManage.type
- 게시판명 : label.sysmanage.bbsManage.boardName
- 게시판 상태 : label.sysmanage.bbsManage.boardStatus
- 게시판유형 : label.sysmanage.bbsManage.boardType
- 게시판 ID : label.sysmanage.bbsManage.boardId
- 게시판 유형 : label.sysmanage.bbsManage.boardType
- 게시판 구성 : label.sysmanage.bbsManage.boardConfig
- 게시판 활성화 : label.sysmanage.bbsManage.boardActive
- 설명 : label.sysmanage.bbsManage.description
- 기능 활성화 : label.sysmanage.bbsManage.featureActive
- 카테고리 : label.sysmanage.bbsManage.category
- 파일 첨부 제한 : label.sysmanage.bbsManage.fileLimit
- 최대 파일 크기(MB) : label.sysmanage.bbsManage.maxFileSize
- 최대 파일 개수 : label.sysmanage.bbsManage.maxFileCount
- 허용 확장자 : label.sysmanage.bbsManage.allowExt
- 운영 설정 : label.sysmanage.bbsManage.operationConfig
- 페이지당 게시물수 : label.sysmanage.bbsManage.pageSize
- 제목 줄임(글자수) : label.sysmanage.bbsManage.titleTrim
- 공개 시작일 : label.sysmanage.bbsManage.openStartDate
- 공개 종료일 : label.sysmanage.bbsManage.openEndDate
- 정렬순서 : label.sysmanage.bbsManage.sortOrder
- 제목 : label.sysmanage.bbsManage.title
- 작성자 : label.sysmanage.bbsManage.writer
- 일시 : label.sysmanage.bbsManage.dateTime
- 작업 : label.sysmanage.bbsManage.action
- 댓글 : label.sysmanage.bbsManage.comment
- 시작일 : label.sysmanage.bbsManage.startDate
- 종료일 : label.sysmanage.bbsManage.endDate
- X좌표 : label.sysmanage.bbsManage.xCoord
- Y좌표 : label.sysmanage.bbsManage.yCoord
- 가로 : label.sysmanage.bbsManage.width
- 세로 : label.sysmanage.bbsManage.height
- 팝업 서비스 활성화 : label.sysmanage.bbsManage.popupActive
- 보지 않기 기능 : label.sysmanage.bbsManage.dontShow

### 플레이스홀더
- 검색 : placeholder.sysmanage.bbsManage.search
- 게시판명* : placeholder.sysmanage.bbsManage.bbsNameRequired
- 카테고리명 : placeholder.sysmanage.bbsManage.categoryName
- jpg, png, pdf (비우면 전체) : placeholder.sysmanage.bbsManage.fileTypeFilter

### 메시지
- 상세 조회 중 오류가 발생했습니다. : message.sysmanage.bbsManage.detail_view_error
- 게시판 ID 채번에 실패했습니다. : message.sysmanage.bbsManage.bbs_id_seq_fail
- 회사를 선택하세요. : message.sysmanage.bbsManage.select_company
- 게시판명* 을 반드시 입력 : message.sysmanage.bbsManage.bbs_name_required
- 저장에 실패했습니다. : message.sysmanage.bbsManage.save_failed
- 저장되었습니다. : message.sysmanage.bbsManage.save_success
- 저장 중 오류가 발생했습니다. : message.sysmanage.bbsManage.save_error
- 삭제하시겠습니까? : message.sysmanage.bbsManage.confirm_delete
- 삭제에 실패했습니다. : message.sysmanage.bbsManage.delete_failed
- 삭제되었습니다. : message.sysmanage.bbsManage.delete_success
- 삭제 중 오류가 발생했습니다. : message.sysmanage.bbsManage.delete_error
- 회사를 먼저 선택하세요. : message.sysmanage.bbsManage.select_company_first
- 등록된 팝업공지가 없습니다. : message.sysmanage.bbsManage.no_popup_notice
- 팝업공지 설정 조회 중 오류가 발생했습니다. : message.sysmanage.bbsManage.popup_config_error
- 팝업공지 미리보기를 불러올 수 없습니다. : message.sysmanage.bbsManage.popup_preview_fail
- 팝업공지 미리보기 조회 중 오류가 발생했습니다. : message.sysmanage.bbsManage.popup_preview_error
- 투표 처리 중 오류가 발생했습니다. : message.sysmanage.bbsManage.vote_error
- 즐겨찾기 처리 중 오류가 발생했습니다. : message.sysmanage.bbsManage.favorite_error
- URL이 클립보드에 복사되었습니다. : message.sysmanage.bbsManage.clipboard_copied
- 클립보드 복사에 실패했습니다. : message.sysmanage.bbsManage.clipboard_copy_fail
- 휴지통의 글을 모두 복원할까요? : message.sysmanage.bbsManage.restore_trash_all_confirm
- 휴지통의 글을 모두 완전 삭제할까요? : message.sysmanage.bbsManage.delete_trash_all_confirm
- 대기 중인 댓글을 모두 승인할까요? : message.sysmanage.bbsManage.approve_pending_comments_all
- 대기 중인 댓글을 모두 거절할까요? : message.sysmanage.bbsManage.reject_pending_comments_all
- 시작일/종료일/X좌표/Y좌표/가로/세로는 필수 입력입니다. : message.sysmanage.bbsManage.required_date_coord_size
- 삭제할까요? : message.sysmanage.bbsManage.confirm_delete_simple
- 정렬 순서 저장에 실패했습니다. : message.sysmanage.bbsManage.sort_save_failed
- 정렬 순서 저장 중 오류가 발생했습니다. : message.sysmanage.bbsManage.sort_save_error
- 카테고리는 최대 {n}개까지 추가할 수 있습니다. : message.sysmanage.bbsManage.category_max_count
- 카테고리명은 한글·영문·숫자·공백·밑줄(_)만 입력할 수 있습니다. : message.sysmanage.bbsManage.category_name_invalid

### 버튼
- 조회 : button.sysmanage.bbsManage.search
- 저장 : button.sysmanage.bbsManage.save
- 삭제 : button.sysmanage.bbsManage.delete
- + : button.sysmanage.bbsManage.plus
- 추가 : button.sysmanage.bbsManage.add
- 복원 : button.sysmanage.bbsManage.restore
- 완전삭제 : button.sysmanage.bbsManage.permanentDelete
- 전체 복원 : button.sysmanage.bbsManage.restoreAll
- 전체 삭제 : button.sysmanage.bbsManage.deleteAll
- 승인 : button.sysmanage.bbsManage.approve
- 거절 : button.sysmanage.bbsManage.reject
- 전체 승인 : button.sysmanage.bbsManage.approveAll
- 전체 거절 : button.sysmanage.bbsManage.rejectAll
- 설정 : button.sysmanage.bbsManage.setting
- 미리보기 : button.sysmanage.bbsManage.preview
- 닫기 : button.sysmanage.bbsManage.close
- 조회 : button.sysmanage.bbsManage.search2
- 공유 : button.sysmanage.bbsManage.share

### 메뉴
- Home : menu.root

### 그외
- 전체 : etc.sysmanage.bbsManage.all
- 목록형 : etc.sysmanage.bbsManage.list
- 카드형 : etc.sysmanage.bbsManage.card
- 앨범형 : etc.sysmanage.bbsManage.album
- 일반 : etc.sysmanage.bbsManage.general
- 공지 : etc.sysmanage.bbsManage.notice
- 익명 : etc.sysmanage.bbsManage.anonymous
- 갤러리 : etc.sysmanage.bbsManage.gallery
- 방명록 : etc.sysmanage.bbsManage.guestbook
- Q&A : etc.sysmanage.bbsManage.qna
- 다시 보지 않기 : etc.sysmanage.bbsManage.hideDontShowAgain
- 오늘 하루 보지 않기 : etc.sysmanage.bbsManage.hideToday
- 대상 추가 : etc.sysmanage.bbsManage.authAddTarget
- 유형을 선택한 뒤 목록에서 항목을 추가하세요. : etc.sysmanage.bbsManage.authAddTargetHint
- 권한 대상 유형(aria) : etc.sysmanage.bbsManage.authTargetTypeAria
- 권한(하위탭) : etc.sysmanage.bbsManage.authTabRole
- 사용자(하위탭) : etc.sysmanage.bbsManage.authTabUser
- 그룹(하위탭) : etc.sysmanage.bbsManage.authTabGroup
- 부서(하위탭) : etc.sysmanage.bbsManage.authTabDept
- 권한명 검색 : etc.sysmanage.bbsManage.authRoleNameSearchPlaceholder
- 이름/사용자ID 검색 : etc.sysmanage.bbsManage.authUserSearchPlaceholder
- 그룹명/그룹ID 검색 : etc.sysmanage.bbsManage.authGroupSearchPlaceholder
- 권한코드 : etc.sysmanage.bbsManage.authCode
- 사용자ID : etc.sysmanage.bbsManage.userId
- 이름 : etc.sysmanage.bbsManage.name
- 부서 : etc.sysmanage.bbsManage.dept
- 그룹ID : etc.sysmanage.bbsManage.groupId
- 부서코드 : etc.sysmanage.bbsManage.deptCode
- 선택 부서(DEPT) 권한으로 추가 : etc.sysmanage.bbsManage.addForDeptPermission
- 부서 단위 권한은 부서코드 대상으로 추가할 수 있습니다. : etc.sysmanage.bbsManage.deptPermissionHint
- 권한 목록 : etc.sysmanage.bbsManage.authList
- 대상 : etc.sysmanage.bbsManage.target
- 열람 : etc.sysmanage.bbsManage.read
- 작성 : etc.sysmanage.bbsManage.write
- 답글 : etc.sysmanage.bbsManage.reply
- 관리 : etc.sysmanage.bbsManage.manage
- 답글 : etc.sysmanage.bbsManage.feature.reply
- 비추천 : etc.sysmanage.bbsManage.feature.dislike
- 비밀글 : etc.sysmanage.bbsManage.feature.secret
- 예약게시 : etc.sysmanage.bbsManage.feature.reserve
- 카테고리 : etc.sysmanage.bbsManage.feature.category
- 댓글 : etc.sysmanage.bbsManage.feature.comment
- 첨부파일 : etc.sysmanage.bbsManage.feature.attach
- 작성자 익명화 : etc.sysmanage.bbsManage.feature.anonymous
- 추천 : etc.sysmanage.bbsManage.feature.like
- 공지 : etc.sysmanage.bbsManage.feature.notice
- 댓글 승인 : etc.sysmanage.bbsManage.feature.commentApproval
- 게시판 상태\n🟢 : 정상\n🟠 : 휴지통/댓글승인\n🔴 : 삭제 : etc.sysmanage.bbsManage.bbsStatusHelpText
- 팝업공지 상태 : etc.sysmanage.bbsManage.popupNoticeStatus
- 게시판 : etc.sysmanage.bbsManage.defaultBoardName
- 문의사항 : etc.sysmanage.bbsManage.qnaName
- 공지사항 : etc.sysmanage.bbsManage.noticeName
- 게시판 기능 프리셋 : etc.sysmanage.bbsManage.featurePresetTitle
- (최대 {n}개 가능. 특수문자 입력 제한) : etc.sysmanage.bbsManage.categoryHint
- 없음 (팝업 미리보기 제목) : etc.sysmanage.bbsManage.popupTitleMissingSuffix
- 읽기수 : etc.sysmanage.bbsManage.readCount
- 추천(툴팁) : etc.sysmanage.bbsManage.recommend
- 비추천(툴팁) : etc.sysmanage.bbsManage.disrecommend
- 즐겨찾기(툴팁) : etc.sysmanage.bbsManage.favorite

---

## 나의홈화면 (`Main`)

### 타이틀
- 나의 홈화면 : title.sysmanage.myHome
- 홈 화면 구성 : title.sysmanage.myHome.homeLayout

### 레이블
- 회사 : label.sysmanage.myHome.company
- 카테고리 : label.sysmanage.myHome.category
- 언어 : label.sysmanage.myHome.language
- 위젯 : label.sysmanage.myHome.widget
- 화면 레이아웃 : label.sysmanage.myHome.layout

### 플레이스홀더
- 위젯명 검색 : placeholder.sysmanage.myHome.searchWidgetName

### 메시지
- 위젯 미리보기를 불러올 수 없습니다. : message.sysmanage.myHome.widget_preview_load_fail
- 배치 JSON(layoutJson) 내용이 비어 있습니다. : message.sysmanage.myHome.layout_json_empty
- 추가 설정 JSON(configJson) 내용이 비어 있습니다. : message.sysmanage.myHome.config_json_empty
- 배치 JSON(layoutJson)이(가) 올바른 JSON이 아닙니다. 키는 큰따옴표로 감싸야 합니다. (예: {"key":"value"}) : message.sysmanage.myHome.layout_json_invalid_format
- 추가 설정 JSON(configJson)이(가) 올바른 JSON이 아닙니다. 키는 큰따옴표로 감싸야 합니다. (예: {"key":"value"}) : message.sysmanage.myHome.config_json_invalid_format
- 저장에 실패했습니다. : message.sysmanage.myHome.save_fail
- 기본값 저장에 실패했습니다. : message.sysmanage.myHome.default_save_fail
- 등록된 위젯이 없습니다. 사이트관리 > 위젯관리에서 회사·사용여부를 확인하세요. : message.sysmanage.myHome.widget_not_registered
- 회사를 선택하면 썸네일 목록이 로드됩니다. : message.sysmanage.myHome.company_select_load_thumbnails
- 구성 패널의 썸네일을 끌어 이 칸에 놓으세요. : message.sysmanage.myHome.thumbnail_drag_drop

### 버튼
- 저장 : button.sysmanage.myHome.save
- 기본값저장 : button.sysmanage.myHome.saveDefault
- 취소 : button.sysmanage.myHome.cancel

### 메뉴
- Home : menu.root

### 그외
- 전체 : etc.sysmanage.myHome.all
- 좌우 2분할 : etc.sysmanage.myHome.splitLR
- 상하 2분할 : etc.sysmanage.myHome.splitTB
- 상단 2칸·하단 전체 : etc.sysmanage.myHome.top2BottomAll
- 상단 전체·하단 2칸 : etc.sysmanage.myHome.topAllBottom2
- 2×2 (4칸) : etc.sysmanage.myHome.grid2x2
- 3×2 (6칸) : etc.sysmanage.myHome.grid3x2
- 3×3 (9칸) : etc.sysmanage.myHome.grid3x3

---

## 내프로필 (`MypageProfile`)

참고 소스:
- `frontend/src/pages/mypage/MypageProfile.tsx`
- `frontend/src/pages/mypage/cmmnMypageI18n.ts`

### 타이틀
- 내 프로필 : title.sysmanage.myProfile
- 사용자 기본 정보 : title.sysmanage.myProfile.userBasicInfo
- 회사별 소속 카드 제목 형식은 그외 키 `etc.sysmanage.myProfile.companySectionTitle` (`회사별 정보 — {companyName}`) 로 표시한다.

### 레이블
- 마이페이지 : label.sysmanage.myProfile.myPage
- 내 프로필 (브레드크럼) : label.sysmanage.myProfile.crumbMyProfile
- 사용자ID : label.sysmanage.myProfile.userId
- 사용자명 : label.sysmanage.myProfile.userName
- 사용자영문명 : label.sysmanage.myProfile.userEnName
- 프로필 사진 : label.sysmanage.myProfile.profileImage
- 성별 구분 : label.sysmanage.myProfile.gender
- 생일 : label.sysmanage.myProfile.birthDate
- 우편번호 : label.sysmanage.myProfile.zipCode
- 도시 : label.sysmanage.myProfile.city
- 주소 1 : label.sysmanage.myProfile.address1
- 주소 2 : label.sysmanage.myProfile.address2
- 주/도/광역시 : label.sysmanage.myProfile.state
- 국가 : label.sysmanage.myProfile.country
- 전화번호 : label.sysmanage.myProfile.phone
- 이동전화번호 : label.sysmanage.myProfile.mobilePhone
- 팩스번호 : label.sysmanage.myProfile.fax
- 이메일 : label.sysmanage.myProfile.email
- 비밀번호 : label.sysmanage.myProfile.password
- 비밀번호 확인 : label.sysmanage.myProfile.passwordConfirm
- 비밀번호 힌트 : label.sysmanage.myProfile.passwordHint
- 비밀번호 답변 : label.sysmanage.myProfile.passwordAnswer
- 사원번호 : label.sysmanage.myProfile.employeeNo
- 직위 : label.sysmanage.myProfile.position
- 입사일 : label.sysmanage.myProfile.joinDate
- 퇴사일 : label.sysmanage.myProfile.leaveDate
- 부서명 : label.sysmanage.myProfile.deptName

### 플레이스홀더
- 우편번호 : placeholder.sysmanage.myProfile.zipCode
- KR : placeholder.sysmanage.myProfile.countryKr
- 빈값이면 현재 비밀번호 유지 : placeholder.sysmanage.myProfile.keepPasswordIfEmpty
- 부서 검색으로 선택 : placeholder.sysmanage.myProfile.selectDeptSearch

### 메시지
- 로그인 정보가 없습니다. : message.sysmanage.myProfile.login_info_not_found
- 프로필을 불러올 수 없습니다. : message.sysmanage.myProfile.profile_load_fail
- 프로필 조회 중 오류가 발생했습니다. : message.sysmanage.myProfile.profile_query_error
- 사용자명을 입력해 주세요. : message.sysmanage.myProfile.username_required
- 사용자영문명을 입력해 주세요. : message.sysmanage.myProfile.user_enname_required
- 비밀번호와 비밀번호 확인이 일치하지 않습니다. : message.sysmanage.myProfile.password_mismatch
- 회사별 정보({companyName})에서 부서를 선택하세요. : message.sysmanage.myProfile.select_department_by_company
- 저장되었습니다. : message.sysmanage.myProfile.save_success
- 저장 실패 : message.sysmanage.myProfile.save_fail_short
- 저장 중 오류가 발생했습니다. : message.sysmanage.myProfile.save_error
- 정말 탈퇴하시겠습니까? : message.sysmanage.myProfile.confirm_withdraw
- 회원이 탈퇴되었습니다. 로그아웃 됩니다. : message.sysmanage.myProfile.member_withdrawn_logout
- 탈퇴 처리 중 오류: {detail} : message.sysmanage.myProfile.withdraw_error
- 이미지 파일만 등록할 수 있습니다. : message.sysmanage.myProfile.image_only_allowed
- 파일 크기는 10MB 이하여야 합니다. : message.sysmanage.myProfile.file_size_limit_10mb
- 이미지 업로드에 실패했습니다. : message.sysmanage.myProfile.image_upload_fail
- 불러오는 중… : message.sysmanage.myProfile.loading
- 소속 회사가 없습니다. 기본 정보만 저장됩니다. : message.sysmanage.myProfile.no_company_basic_saved

### 버튼
- 저장 : button.sysmanage.myProfile.save
- 탈퇴 : button.sysmanage.myProfile.withdraw
- 사진 선택 : button.sysmanage.myProfile.selectPhoto
- 사진 삭제 : button.sysmanage.myProfile.deletePhoto
- Q (부서 검색) : button.sysmanage.myProfile.searchDepartment

### 메뉴
- Home : menu.root

### 그외
- 선택 : etc.sysmanage.myProfile.select
- 업로드 중… : etc.sysmanage.myProfile.uploading
- 회사별 정보 — {companyName} : etc.sysmanage.myProfile.companySectionTitle
- 전체메뉴 닫힘 (탈퇴 후 레이아웃과 동일 키 재사용) : etc.sysmanage.layout.allMenuClosedTitle

---

## 사용자게시판 (`BbsUserList`, `BbsUserWrite`, `BbsUserSidebar`)

### 타이틀
- 사용자 게시판 : title.sysmanage.userBoard
- 팝업 미리보기 : title.sysmanage.userBoard.popupPreview
- 게시글 작성 : title.sysmanage.userBoard.writePost
- 게시글 수정 : title.sysmanage.userBoard.editPost
- 게시판 (좌측 네비) : title.sysmanage.userBoard.bbs

### 레이블
- 목록 내 검색 : label.sysmanage.userBoard.listSearch
- 댓글 : label.sysmanage.userBoard.comment
- 답글 : label.sysmanage.userBoard.reply
- 작성자 : label.sysmanage.userBoard.author
- 작성일자 : label.sysmanage.userBoard.createDate
- 제목 : label.sysmanage.userBoard.title
- 내용 : label.sysmanage.userBoard.content
- 첨부파일 : label.sysmanage.userBoard.attachment
- 예약게시 : label.sysmanage.userBoard.scheduledPost
- 시작일시 : label.sysmanage.userBoard.startDateTime
- 종료일시 : label.sysmanage.userBoard.endDateTime

### 플레이스홀더
- 목록 내 검색 : placeholder.sysmanage.userBoard.searchInList
- 댓글을 입력하세요 : placeholder.sysmanage.userBoard.enterComment
- 답글을 입력하세요 : placeholder.sysmanage.userBoard.enterReply
- 댓글을 수정합니다 : placeholder.sysmanage.userBoard.editComment
- 제목을 입력하세요 : placeholder.sysmanage.userBoard.enterTitle
- 내용을 입력하세요 : placeholder.sysmanage.userBoard.enterContent

### 메시지
- 메인 등에서 회사를 선택하면 게시판 목록이 표시됩니다. : message.sysmanage.userBoard.main_company_board_list
- 게시판을 먼저 선택해 주세요. : message.sysmanage.userBoard.board_select_first
- 이미지 파일만 첨부할 수 있습니다. : message.sysmanage.userBoard.image_only_attach
- 댓글 사진은 최대 4장까지 첨부할 수 있습니다. : message.sysmanage.userBoard.commentImageCountMax
- 각 이미지는 10MB 이하여야 합니다. : message.sysmanage.userBoard.commentImageEachMax
- 댓글 첨부 이미지 합계는 10MB를 넘을 수 없습니다. : message.sysmanage.userBoard.commentImageTotalMax
- 파일 업로드에 실패했습니다. : message.sysmanage.userBoard.file_upload_fail
- URL이 클립보드에 복사되었습니다. : message.sysmanage.userBoard.url_copied
- 팝업 목록 조회 중 오류가 발생했습니다. : message.sysmanage.userBoard.popup_list_error
- 팝업 미리보기를 불러올 수 없습니다. : message.sysmanage.userBoard.popup_preview_fail
- 팝업 설정을 불러올 수 없습니다. : message.sysmanage.userBoard.popup_config_fail
- 시작일/종료일/X좌표/Y좌표/가로/세로는 필수 입력입니다. : message.sysmanage.userBoard.required_coords
- 날짜 형식이 올바르지 않습니다. : message.sysmanage.userBoard.invalid_date_format
- 종료일은 시작일보다 늦어야 합니다. : message.sysmanage.userBoard.end_after_start
- 좌표는 0 이상, 가로/세로는 1 이상이어야 합니다. : message.sysmanage.userBoard.coord_rules
- 저장되었습니다. : message.sysmanage.userBoard.save_success
- 저장 중 오류가 발생했습니다. : message.sysmanage.userBoard.save_error
- 삭제되었습니다. : message.sysmanage.userBoard.delete_success
- 삭제 중 오류가 발생했습니다. : message.sysmanage.userBoard.delete_error
- 팝업 서비스 활성화가 꺼져 있어 미리보기를 열 수 없습니다. : message.sysmanage.userBoard.popup_disabled_preview
- 게시판 정보가 없습니다. : message.sysmanage.userBoard.no_board_info
- 게시판 정보를 불러오지 못했습니다. : message.sysmanage.userBoard.board_info_load_fail
- 회사 선택 정보가 없습니다. : message.sysmanage.userBoard.no_company_info
- 제목/내용은 필수입니다. : message.sysmanage.userBoard.title_content_required
- 앨범형 게시판은 이미지 첨부를 1개 이상 등록해야 합니다. : message.sysmanage.userBoard.album_requires_image
- 이 게시판은 첨부파일 기능을 사용하지 않습니다. : message.sysmanage.userBoard.no_attach_feature
- 관리자 첨부파일 설정값을 확인할 수 없습니다. : message.sysmanage.userBoard.admin_attach_config_missing
- 예약게시를 선택한 경우 시작일 또는 종료일을 입력해 주세요. : message.sysmanage.userBoard.reserved_posting_require_dates
- 게시 시작일시는 종료일시보다 클 수 없습니다. : message.sysmanage.userBoard.post_start_not_after_end
- 게시글이 수정되었습니다. : message.sysmanage.userBoard.post_updated
- 게시글이 등록되었습니다. : message.sysmanage.userBoard.post_created
- 게시글 삭제에 실패했습니다. : message.sysmanage.userBoard.post_delete_fail
- 게시글이 삭제되었습니다. : message.sysmanage.userBoard.post_deleted

### 버튼
- 조회 : button.sysmanage.userBoard.search
- 저장 : button.sysmanage.userBoard.save
- 삭제 : button.sysmanage.userBoard.delete
- 복원 : button.sysmanage.userBoard.restore
- 완전삭제 : button.sysmanage.userBoard.permanentDelete
- 승인 : button.sysmanage.userBoard.approve
- 거절 : button.sysmanage.userBoard.reject
- 닫기 : button.sysmanage.userBoard.close
- 취소 : button.sysmanage.userBoard.cancel
- 업로드 : button.sysmanage.userBoard.upload

### 메뉴
- Home : menu.root

### 그외
- 공유 : etc.sysmanage.userBoard.share
- 추천 : etc.sysmanage.userBoard.recommend
- 비추천 : etc.sysmanage.userBoard.notRecommend
- 즐겨찾기 전체글 : etc.sysmanage.userBoard.favAll
- 전체글 보기 : etc.sysmanage.userBoard.allList
- ★ 즐겨찾기만 보기 : etc.sysmanage.userBoard.favOnly
- 즐겨찾기 해제 : etc.sysmanage.userBoard.favCancel
- 즐겨찾기 추가 : etc.sysmanage.userBoard.favAdd
- 불러오는 중… : etc.sysmanage.userBoard.loading
- {unread}/{total} : etc.sysmanage.userBoard.count

### 추가 키 (`BbsUserList`, `BbsUserWrite` 확장)
- 게시판(폴백 타이틀) : label.sysmanage.userBoard.board
- 정렬 : label.sysmanage.userBoard.sort
- 새로고침 : button.sysmanage.userBoard.refresh
- 글쓰기 : button.sysmanage.userBoard.write
- 이전 : button.sysmanage.userBoard.prev
- 다음 : button.sysmanage.userBoard.next
- 공유 : button.sysmanage.userBoard.share
- 답글 : button.sysmanage.userBoard.reply
- 수정 : button.sysmanage.userBoard.edit
- 미리보기 : button.sysmanage.userBoard.preview
- 팝업 설정 : button.sysmanage.userBoard.popupSetting
- 등록 : button.sysmanage.userBoard.register
- 제목 입력 플레이스홀더 : placeholder.sysmanage.userBoard.writeTitle
- 내용 입력 플레이스홀더 : placeholder.sysmanage.userBoard.writeContents
- 목록 로딩/상세 로딩/첨부 로딩/댓글 로딩 : message.sysmanage.userBoard.loadingList, message.sysmanage.userBoard.loadingDetail, message.sysmanage.userBoard.loadingFiles, message.sysmanage.userBoard.loadingComments
- 게시글 없음/첨부 없음/댓글 없음 : message.sysmanage.userBoard.noPosts, message.sysmanage.userBoard.noFiles, message.sysmanage.userBoard.noComments
- 게시글 선택/상세 조회 실패 : message.sysmanage.userBoard.selectPost, message.sysmanage.userBoard.cannotLoadPost
- 게시글 삭제 확인 : message.sysmanage.userBoard.confirmDeletePost
- 팝업 설정 없음 : message.sysmanage.userBoard.popupSettingMissing
- 팝업 삭제 확인 : message.sysmanage.userBoard.confirmDeletePopup
- 댓글 삭제 확인 : message.sysmanage.userBoard.confirmDeleteComment
- 댓글 등록/수정/삭제 실패 : message.sysmanage.userBoard.commentCreateFail, message.sysmanage.userBoard.commentUpdateFail, message.sysmanage.userBoard.commentDeleteFail
- 답글 등록 실패 : message.sysmanage.userBoard.replyCreateFail
- 첨부 개수/용량/확장자 검사 : message.sysmanage.userBoard.attachCountMax, message.sysmanage.userBoard.attachEachMax, message.sysmanage.userBoard.allowedExtOnly
- 게시글 등록/수정/삭제 성공·실패 : message.sysmanage.userBoard.postCreateSuccess, message.sysmanage.userBoard.postUpdateSuccess, message.sysmanage.userBoard.postCreateFail, message.sysmanage.userBoard.postUpdateFail, message.sysmanage.userBoard.postDeleteSuccess, message.sysmanage.userBoard.postDeleteFail
- 정렬 라벨 (오래된순/최신순) : etc.sysmanage.userBoard.oldest, etc.sysmanage.userBoard.latest
- 조회 : etc.sysmanage.userBoard.viewCount
- 익명 : etc.sysmanage.userBoard.anonymous
- 답글 취소/수정 저장/제거 : etc.sysmanage.userBoard.replyCancel, etc.sysmanage.userBoard.editSave, etc.sysmanage.userBoard.remove
- 사진 추가 : button.sysmanage.userBoard.addPhoto
- 업로드 중... : etc.sysmanage.userBoard.uploading
- 최대 4장·합계 10MB : message.sysmanage.userBoard.comment_photo_hint
- 즐겨찾기 : etc.sysmanage.userBoard.favorite
- 가운데 영역 축소, 오른쪽 영역 확대 : etc.sysmanage.userBoard.paneShrinkMiddleExpandRight
- 가운데 영역 확대, 오른쪽 영역 축소 : etc.sysmanage.userBoard.paneExpandMiddleShrinkRight
- 오른쪽 영역 숨기기 : etc.sysmanage.userBoard.paneHideRight
- 저장 중... : etc.sysmanage.userBoard.saving
- 삭제 중... : etc.sysmanage.userBoard.deleting
- 굵게 : etc.sysmanage.userBoard.toolbarBold
- 기울임 : etc.sysmanage.userBoard.toolbarItalic
- 밑줄 : etc.sysmanage.userBoard.toolbarUnderline
- 글머리 기호 : etc.sysmanage.userBoard.toolbarBullets
- 번호 매기기 : etc.sysmanage.userBoard.toolbarNumbering
- 정렬 : etc.sysmanage.userBoard.toolbarAlign
- 링크 : etc.sysmanage.userBoard.toolbarLink
- 쓰기 : etc.sysmanage.userBoard.writeAction
- 메모 게시판 : etc.sysmanage.userBoard.memo
- 사용자 정의 : etc.sysmanage.userBoard.custom

---

## 나의 홈화면 (`Main.tsx`, `cmmnMainHomeI18n.ts`)

### 타이틀
- 나의 홈화면 : title.sysmanage.myHome.pageTitle
- 홈 화면 구성 : title.sysmanage.myHome.openConfig

### 레이블
- 전체(카테고리) : label.sysmanage.myHome.categoryAll
- 회사 : label.sysmanage.myHome.company
- 카테고리 : label.sysmanage.myHome.category
- 위젯(갤러리 섹션) : label.sysmanage.myHome.gallery
- 화면 레이아웃 : label.sysmanage.myHome.layoutPick
- 배치 JSON(layoutJson) : label.sysmanage.myHome.jsonLayoutField
- 추가 설정 JSON(configJson) : label.sysmanage.myHome.jsonConfigField

### 플레이스홀더
- 위젯명 검색 : placeholder.sysmanage.myHome.searchWidget

### 메시지
- 구성 패널 안내(빈 슬롯) : message.sysmanage.myHome.hintSelectWidgetSlot
- 등록된 위젯이 없습니다… : message.sysmanage.myHome.galleryEmpty
- 회사를 선택하면 썸네일 목록이 로드됩니다. : message.sysmanage.myHome.galleryLoadHint
- 구성 패널 안내(드래그·도킹) : message.sysmanage.myHome.galleryDragHint, message.sysmanage.myHome.dockMoveHint
- JSON 비어 있음/형식 오류 : message.sysmanage.myHome.jsonFieldEmpty, message.sysmanage.myHome.jsonInvalid (치환 `{field}`)
- 저장 실패 : message.sysmanage.myHome.saveFailed
- 기본값 저장 실패 : message.sysmanage.myHome.saveDefaultFailed
- 위젯 미리보기 실패(iframe 폴백) : message.sysmanage.myHome.widgetPreviewUnavailable

### 버튼
- 저장 : button.sysmanage.myHome.save
- 기본값저장 : button.sysmanage.myHome.saveDefault
- 취소 : button.sysmanage.myHome.cancel

### 그외(레이아웃 프리셋)
- 좌우 2분할 : etc.sysmanage.myHome.layoutSplitV
- 상하 2분할 : etc.sysmanage.myHome.layoutSplitH
- 상단 2칸·하단 전체 : etc.sysmanage.myHome.layoutSplitT
- 상단 전체·하단 2칸 : etc.sysmanage.myHome.layoutSplitTInv
- 2×2 (4칸) : etc.sysmanage.myHome.layoutGrid2x2
- 3×2 (6칸) : etc.sysmanage.myHome.layoutGrid3x2
- 3×3 (9칸) : etc.sysmanage.myHome.layoutGrid3x3
- iframe 제목 `{name} 미리보기` : etc.sysmanage.myHome.iframePreviewTitle
- 미리보기 토큰 라벨 제목/값/데이터 : etc.sysmanage.myHome.previewTokenTitle, etc.sysmanage.myHome.previewTokenValue, etc.sysmanage.myHome.previewTokenData

### 접근성(aria)
- 위젯 제거 : aria.sysmanage.myHome.removeWidget
- 패널 닫기 : aria.sysmanage.myHome.closeDock
- 홈 화면 구성 열기(헤더 그리드 버튼) : aria.sysmanage.myHome.openConfigToolbar

---

## 공통레이아웃 (`Header`, `LeftSidebar`, `Footer`)

참고 소스:
- `frontend/src/components/Header.tsx`
- `frontend/src/components/cmmnLayoutChromeI18n.ts` (`Header`, `LeftSidebar`, `Footer` 공통 키 정의)
- `frontend/src/components/LeftSidebar.tsx`
- `frontend/src/components/Footer.tsx`

### 타이틀
- (로고 alt) 사내업무포털 : title.layout.portalBrand

### 레이블
- 계정 : label.layout.account
- 테마 변경 : label.layout.themeChange
- 대표문의메일 : label.layout.contactEmail (`Footer.tsx` 본문 접두)
- 대표전화 : label.layout.contactPhone (`Footer.tsx` 본문 접두)

### 플레이스홀더
- (없음)

### 메시지
- 로그아웃되었습니다! : message.sysmanage.account.logout_success
- 로그인 안내 `{name}`, `{userSe}` 치환 : message.sysmanage.account.login_info
- 사이드바/라우트가드: 로그인 후 메뉴 안내 : message.sysmanage.layout.sidebarLoginRequired
- 사이드바: 회사 선택 안내 : message.sysmanage.layout.sidebarCompanyRequired
- 사이드바: 표시 메뉴 없음 안내 : message.sysmanage.layout.sidebarNoMenu

### 버튼
- 로그인 : button.sysmanage.account.login
- 로그아웃 : button.sysmanage.account.logout
- 내 프로필 : button.sysmanage.account.myProfile
- 비밀번호 : button.sysmanage.account.password
- 라이트 : button.sysmanage.account.light
- 다크 : button.sysmanage.account.dark
- 야간 : button.sysmanage.account.night
- 시스템 기본값 : button.sysmanage.account.systemDefault

### 그외
- 전체메뉴 닫힘 (.btnAllMenu title) : etc.sysmanage.layout.allMenuClosedTitle
- 홈 화면 구성 (title) → `title.sysmanage.myHome.openConfig` (`Main.tsx`·`Header` 공통·`cmmnLayoutChromeI18n`)
- 홈 화면 구성 열기 (aria) → `aria.sysmanage.myHome.openConfigToolbar`
- 게시판 메뉴로 전환 (title) : etc.sysmanage.layout.boardMenuToggleToBoardTitle
- 일반 메뉴로 전환 (title) : etc.sysmanage.layout.boardMenuToggleToGeneralTitle
- 게시판 메뉴로 전환 (aria) : aria.sysmanage.layout.boardMenuToggleToBoard
- 일반 메뉴로 전환 (aria) : aria.sysmanage.layout.boardMenuToggleToGeneral
- 계정 메뉴 (avatar title) : aria.sysmanage.layout.accountMenu
- 사용자 팝업 닫기 (aria) : aria.sysmanage.layout.closeUserPopover
- 언어 셀렉트 폴백 라벨 : etc.sysmanage.layout.langOptionKoKr, etc.sysmanage.layout.langOptionEnUs
- (레거시·미사용 문구 참고) 게시판 보기 / 사용자 게시판 메뉴 펼치기 / 메뉴 접기
- 사이드바 접기/펼치기 (title·aria) : aria.sysmanage.layout.sidebarExpandMenu, aria.sysmanage.layout.sidebarCollapseMenu
- 풋터 저작권 한 줄 : etc.sysmanage.layout.footerCopyright

### 메뉴
- 홈 : menu.root
- 시스템관리 : menu.sysmanage.langmanage.systemmanage
- 사이트관리 : menu.sysmanage.authormanage.siteManage
- 다국어관리 : menu.sysmanage.langmanage.multilangmanage
- 공통코드관리 : menu.sysmanage.langmanage.commcodemanage
- 프로그램관리 : menu.sysmanage.progrmmanage.manage
- 메뉴관리 : menu.sysmanage.menumanage
- 그룹관리 : menu.sysmanage.authormanage.groupsManage
- 권한관리 : menu.sysmanage.authormanage.authormanage
- 회사정보관리 : menu.sysmanage.authormanage.companyInfoManage
- 사용자관리 : menu.sysmanage.authormanage.userManage
- 위젯데이터셋관리 : menu.sysmanage.authormanage.widgetDatasetManage
- 위젯스타일관리 : menu.sysmanage.authormanage.widgetStyleManage
- 위젯관리 : menu.sysmanage.authormanage.widgetManage
- 게시판관리 : menu.sysmanage.authormanage.boardManage

---

## 로그인/가입/비밀번호 (`LoginContent`, `UserJoin`, `UserPasswordUpdate`)

참고 소스:
- `frontend/src/pages/login/LoginContent.tsx`
- `frontend/src/pages/login/cmmnLoginAuthI18n.ts` (로그인·회사가입·암호변경 키 상수 및 한글 폴백)
- `frontend/src/components/sns/SnsNaverBt.tsx`
- `frontend/src/components/sns/SnsKakaoBt.tsx`
- `frontend/src/components/sns/SnsNaverCallback.tsx`
- `frontend/src/components/sns/SnsKakaoCallback.tsx`
- `frontend/src/api/egovFetch.tsx` (로그인 공통 메시지 폴백 재사용)
- `frontend/src/pages/system/UserJoin.tsx`
- `frontend/src/pages/system/user/UserPasswordUpdate.tsx`

### 타이틀
- 로그인 : title.sysmanage.login
- 회원가입 (`UserJoin`) : title.sysmanage.login.signUp
- 비밀번호 변경 (`UserPasswordUpdate`) : title.sysmanage.login.changePassword
- 약관 확인 팝업 제목 (`UserJoin`) : title.sysmanage.joinCompany.confirm_terms

### 레이블 (로그인·암호변경 공통 패턴)
- 아이디 : label.sysmanage.login.id
- 비밀번호 : label.sysmanage.login.password
- 비밀번호 확인 : label.sysmanage.login.passwordConfirm
- 이메일 : label.sysmanage.login.email
- 기존 암호 (`UserPasswordUpdate`) : label.sysmanage.login.oldPassword
- 신규 암호 (`UserPasswordUpdate`) : label.sysmanage.login.newPassword
- 입력 확인 (`UserPasswordUpdate`) : label.sysmanage.login.confirmInput
- 시스템관리 (`UserPasswordUpdate` 브레드크럼) : label.sysmanage.userManage.system
- 사용자관리 (`UserPasswordUpdate` 브레드크럼 링크) : title.sysmanage.userManage

### 레이블 (회사 가입 신청 `UserJoin`)
- 회사ID : label.sysmanage.joinCompany.company_id
- 회사명 : label.sysmanage.joinCompany.company_name
- 기업 구분 : label.sysmanage.joinCompany.entrprs_gb
- 업종코드 : label.sysmanage.joinCompany.industry_cd
- 대표이사 : label.sysmanage.joinCompany.ceo
- 사업자 등록번호 : label.sysmanage.joinCompany.biz_reg_no
- 법인 등록번호 : label.sysmanage.joinCompany.corp_reg_no
- 도시 : label.sysmanage.joinCompany.city
- 주/도/광역시 : label.sysmanage.joinCompany.state
- 주소 1 : label.sysmanage.joinCompany.address_one
- 주소 2 : label.sysmanage.joinCompany.address_two
- 국가 : label.sysmanage.joinCompany.country
- 우편번호 : label.sysmanage.joinCompany.zip
- 전화번호 : label.sysmanage.joinCompany.phone
- 팩스번호 : label.sysmanage.joinCompany.fax
- 신청자 아이디 : label.sysmanage.joinCompany.applicant_id
- 신청자 이름 : label.sysmanage.joinCompany.applicant_name
- 신청자 이메일 : label.sysmanage.joinCompany.applicant_email
- 약관내용 : label.sysmanage.joinCompany.terms_content
- 정보동의내용 : label.sysmanage.joinCompany.info_consent_content
- (체크 문구) 약관 내용에 동의합니다. : label.sysmanage.joinCompany.agree_terms_check
- (체크 문구) 정보이용 내용에 동의합니다. : label.sysmanage.joinCompany.agree_info_check

### 플레이스홀더 (`LoginContent`)
- 아이디 입력 : placeholder.sysmanage.login.enterUserId
- 비밀번호 입력 : placeholder.sysmanage.login.enterPassword

### 메시지
- 로그인이 필요한 경로입니다. : message.sysmanage.login.login_required_path
- 서버와의 연결이 원활하지 않습니다. 서버를 확인하세요. : message.sysmanage.login.server_connection_error
- 로그아웃되었습니다! : message.sysmanage.login.logout_success
- Sns 간편 로그인 중... (`Sns*Naver/KakaoCallback`) : message.sysmanage.login.sns_simple_login_in_progress
- 로그인 중... (`Sns*Naver/KakaoCallback`) : message.sysmanage.login.logging_in
- 비밀번호 입력 후 진행 확인 (`LoginContent`) : message.sysmanage.login.check_password_then_submit
- 아이디 입력 요청 (`LoginContent`) : message.sysmanage.login.enter_id_required
- 비밀번호 입력 요청 (`LoginContent`) : message.sysmanage.login.enter_password_required
- 로그인 실패 기본 문구 (`LoginContent`) : message.sysmanage.login.login_fail_default
- 기존 암호 필수 (`UserPasswordUpdate`) : message.sysmanage.login.old_password_required
- 신규 암호 필수 (`UserPasswordUpdate`) : message.sysmanage.login.new_password_required
- 신규 암호가 기존과 동일 (`UserPasswordUpdate`) : message.sysmanage.login.new_password_same_as_old
- 신규 암호·확인 불일치 (`UserPasswordUpdate`) : message.sysmanage.login.new_password_confirm_mismatch
- 변경 성공 시 안내 (`UserPasswordUpdate`) : message.sysmanage.login.password_change_success_hint
- 변경 실패 안내 (`UserPasswordUpdate`) : message.sysmanage.login.password_change_not_applied
- 변경 중 오류 (`UserPasswordUpdate`) : message.sysmanage.login.password_change_error
- 회사 ID 입력 후 중복 검색 안내 (`UserJoin`) : message.sysmanage.joinCompany.enter_company_id_for_dup
- 사용 가능한 아이디 (`UserJoin`) : message.sysmanage.joinCompany.id_available
- 사용 불가 아이디 (`UserJoin`) : message.sysmanage.joinCompany.id_not_available
- 중복 검사 오류 (`UserJoin`) : message.sysmanage.joinCompany.dup_check_error
- 약관 동의 체크 요청 (`UserJoin`) : message.sysmanage.joinCompany.agree_check_required
- 회사 ID 필수 (`UserJoin`) : message.sysmanage.joinCompany.enter_company_id
- 중복 검색 필수 (`UserJoin`) : message.sysmanage.joinCompany.dup_must_run
- 회사명 필수 (`UserJoin`) : message.sysmanage.joinCompany.enter_company_name
- 사업자등록번호 필수 (`UserJoin`) : message.sysmanage.joinCompany.enter_biz_no
- 신청자 아이디 필수 (`UserJoin`) : message.sysmanage.joinCompany.enter_applicant_id
- 약관 미동의 시 가입 불가 (`UserJoin`) : message.sysmanage.joinCompany.must_agree_terms_for_join
- 회사 가입신청 완료 (`UserJoin`) : message.sysmanage.joinCompany.join_completed
- 저장 오류 폴백 (`UserJoin`, 서버 메시지 없을 때) : message.sysmanage.joinCompany.save_error_fallback
- 저장 네트워크 오류 (`UserJoin`) : message.sysmanage.joinCompany.save_error_network
- 약관 비동의 진행 불가 안내 (`UserJoin`) : message.sysmanage.joinCompany.reject_need_agree_else

### 버튼
- 로그인 : button.sysmanage.login.login
- 회원가입 (`LoginContent`) : button.sysmanage.login.signup
- 네이버 로그인 (`SnsNaverBt`) : button.sysmanage.login.naver_login
- 카카오 로그인 (`SnsKakaoBt`) : button.sysmanage.login.kakao_login
- 변경 (`UserPasswordUpdate`) : button.sysmanage.login.change
- 목록 (`UserPasswordUpdate`) : button.sysmanage.userPassword.list
- 저장 (`UserJoin`) : button.sysmanage.joinCompany.save
- 약관 확인 (`UserJoin`) : button.sysmanage.joinCompany.confirm_terms
- 중복 아이디 검색 (`UserJoin`) : button.sysmanage.joinCompany.dup_check_id
- 닫기 (`UserJoin` 약관 팝업) : button.sysmanage.joinCompany.close
- 비동의 (`UserJoin`) : button.sysmanage.joinCompany.disagree
- 동의 (`UserJoin`) : button.sysmanage.joinCompany.agree

### 메뉴
- Home : menu.root

### 그외 (`LoginContent` 안내 문구 등)
- ID 저장 체크 : etc.sysmanage.login.id_save
- 로그인 상단 안내 1줄 : etc.sysmanage.login.intro_line1
- 로그인 상단 안내 2줄 : etc.sysmanage.login.intro_line2
- 비밀번호 조합 안내 : etc.sysmanage.login.tip_password_mix
- 비밀번호 주기 변경 안내 : etc.sysmanage.login.tip_password_rotate
- 전체메뉴 닫힘 (로그인 성공 시 title, 레이아웃 공통키) : etc.sysmanage.layout.allMenuClosedTitle
- (셀렉트 첫 줄) 선택 (`UserJoin`) : etc.sysmanage.joinCompany.select_placeholder
- 비즈니스 규칙 제목 (`UserJoin`) : etc.sysmanage.joinCompany.biz_rules_title
- 비즈니스 규칙 본문 한 줄 (`UserJoin`) : etc.sysmanage.joinCompany.biz_rules_line
- 관리자 메모 제목 (`UserJoin`) : etc.sysmanage.joinCompany.admin_memo_title
- 관리자 메모 줄1 (`UserJoin`) : etc.sysmanage.joinCompany.admin_memo_line1
- 관리자 메모 줄2 (`UserJoin`) : etc.sysmanage.joinCompany.admin_memo_line2

---

## 공통팝업/컴포넌트 (`MultilingualLookupPopup`, `PopupNoticeLayer`, `BbsManageAuthorTab`, `DeptSearchPopup`, `AttachFile`, `Error`, `InfoPopup`, `Paging`)

참고 소스:
- `frontend/src/components/MultilingualLookupPopup.tsx`
- `frontend/src/components/PopupNoticeLayer.tsx`
- `frontend/src/pages/sites/bbs/BbsManageAuthorTab.tsx`
- `frontend/src/components/DeptSearchPopup.tsx`
- `frontend/src/components/DeptTreeView.tsx`
- `frontend/src/components/AttachFile.tsx`
- `frontend/src/components/Error.tsx`
- `frontend/src/components/InfoPopup.tsx`
- `frontend/src/components/Paging.tsx`
- `frontend/src/components/cmmnComponentI18n.ts`

### 타이틀
- 다국어 조회 : title.sysmanage.i18nSearch
- 팝업 공지 : title.sysmanage.i18nSearch.popupNotice
- 권한 검색 : title.sysmanage.i18nSearch.authSearch
- 부서 검색 : title.sysmanage.i18nSearch.deptSearch
- 홈페이지 템플릿 소개 : title.sysmanage.i18nSearch.homeTemplateIntro

### 레이블
- 번호 : label.sysmanage.i18nSearch.no
- 구분 : label.sysmanage.i18nSearch.type
- 언어 Key : label.sysmanage.i18nSearch.langKey
- 다국어 : label.sysmanage.i18nSearch.multiLang
- 권한명 : label.sysmanage.i18nSearch.roleName
- 사용자 : label.sysmanage.i18nSearch.user
- 그룹 : label.sysmanage.i18nSearch.group
- 첨부파일 : label.sysmanage.i18nSearch.attachment
- 작성자 : label.sysmanage.i18nSearch.author
- 작성일자 : label.sysmanage.i18nSearch.createdDate
- 추천 : label.sysmanage.i18nSearch.recommend
- 비추천 : label.sysmanage.i18nSearch.disrecommend
- 즐겨찾기 : label.sysmanage.i18nSearch.favorite

### 플레이스홀더
- 언어 Key/다국어 검색 : placeholder.sysmanage.i18nSearch.searchLangKeyMulti
- 다국어를 조회해 선택하세요 : placeholder.sysmanage.i18nSearch.selectMultilingual
- 권한명 검색 : placeholder.sysmanage.i18nSearch.searchAuthName
- 이름/사용자ID 검색 : placeholder.sysmanage.i18nSearch.searchUserNameId
- 그룹명/그룹ID 검색 : placeholder.sysmanage.i18nSearch.searchGroupNameId

### 메시지
- URL이 클립보드에 복사되었습니다. : message.sysmanage.i18nSearch.url_copied
- 조회된 부서가 없습니다. : message.sysmanage.i18nSearch.no_department_found
- 회사를 선택한 뒤 부서 트리가 조회됩니다. : message.sysmanage.i18nSearch.select_company_for_dept_tree
- 첨부파일이 삭제되었습니다. : message.sysmanage.i18nSearch.file_deleted
- 총 첨부파일 개수는 {n} 까지 입니다. : message.sysmanage.i18nSearch.file_limit_total
- 총 업로드 가능한 첨부파일 개수는 {n} 개 입니다. : message.sysmanage.i18nSearch.file_upload_limit
- 현재 업로드 가능한 첨부파일 개수는 {remain} 개 입니다. : message.sysmanage.i18nSearch.file_upload_remain
- 알 수 없는 에러가 발생했습니다. : message.sysmanage.i18nSearch.unknown_error
- 불러오는 중… : message.sysmanage.i18nSearch.loading_inline
- (제목 없음) : message.sysmanage.i18nSearch.untitled

### 버튼
- 조회 : button.sysmanage.i18nSearch.search
- 선택 : button.sysmanage.i18nSearch.select
- 닫기 : button.sysmanage.i18nSearch.close
- 이전페이지 : button.sysmanage.i18nSearch.prevPage
- 처음 : button.sysmanage.i18nSearch.first
- 이전 : button.sysmanage.i18nSearch.prev
- 다음 : button.sysmanage.i18nSearch.next
- 공유 : button.sysmanage.i18nSearch.share
- 다시 보지 않기 : button.sysmanage.i18nSearch.neverShow
- 오늘 하루 보지 않기 : button.sysmanage.i18nSearch.hideToday

### 그외
- 드래그 : etc.sysmanage.i18nSearch.drag
- [byte] (파일 크기 표시 단위) : etc.sysmanage.i18nSearch.byte --------------
- Error (페이지 제목) : etc.sysmanage.i18nSearch.error ----------------
- × (팝업 닫기·제거 등) : etc.sysmanage.i18nSearch.close ----------------------
- 전체 (다국어 조회 구분 기본값) : etc.sysmanage.i18nSearch.all
 