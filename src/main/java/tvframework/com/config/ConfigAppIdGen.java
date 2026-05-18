package tvframework.com.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import tvframework.com.cmm.util.IdGnrBuilder;
import tvframework.com.cmm.idgnr.impl.TableIdGnrServiceImpl;
import tvframework.com.cmm.idgnr.strategy.impl.IdGnrStrategyImpl;

/**
 * @ClassName : ConfigAppIdGen.java
 * @Description : IdGeneration 설정
 *
 * @author : 윤주호
 * @since  : 2021. 7. 20
 * @version : 1.0
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일              수정자               수정내용
 *  -------------  ------------   ---------------------
 *   2021. 7. 20    윤주호               최초 생성
 * </pre>
 *
 */
@Configuration
public class ConfigAppIdGen {

    private final DataSource dataSource;

    private final DataSource egovDataSource;

    public ConfigAppIdGen(
        @Qualifier("dataSource") DataSource dataSource,
        @Qualifier("egovDataSource") DataSource egovDataSource
    ) {
        this.dataSource = dataSource;
        this.egovDataSource = egovDataSource;
    }

	// 구현 방법 1:

	/**
	 * 첨부파일 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovFileIdGnrService() {
		TableIdGnrServiceImpl tableIdGnrServiceImpl = new TableIdGnrServiceImpl();
		tableIdGnrServiceImpl.setDataSource(dataSource);
		tableIdGnrServiceImpl.setStrategy(fileStrategy());
		tableIdGnrServiceImpl.setBlockSize(10);
		tableIdGnrServiceImpl.setTable("CM_IDS");
		tableIdGnrServiceImpl.setTableName("FILE_ID");
		return tableIdGnrServiceImpl;
	}

	/**
	 * CM_FILE.FILE_SQ 시퀀스 (CM_IDS.TABLE_NAME = 'FILE_SQ'). 숫자만 증가, 표시는 FILE- + 패딩.
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl cmFileSqIdGnrService() {
		TableIdGnrServiceImpl impl = new TableIdGnrServiceImpl();
		impl.setDataSource(dataSource);
		impl.setTable("CM_IDS");
		impl.setTableName("FILE_SQ");
		impl.setBlockSize(10);
		return impl;
	}

	/**
	 * CM_WIDGET.WIDGET_ID (CM_IDS.TABLE_NAME = 'WIDGET_ID'). 공통 IdGnrBuilder·IdGnrStrategy 적용, 채번은 getNextStringId() 사용.
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl widgetIdGnrService() {
		return new IdGnrBuilder().setDataSource(dataSource).setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("WIDGET_ID")
			.setPreFix("WIDGET-")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	/**
	 * CM_BBS_AUTHOR.AUTHOR_SQ (CM_IDS.TABLE_NAME = 'BBS_AUTHOR_ID', 숫자 시퀀스)
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl bbsAuthorIdGnrService() {
		TableIdGnrServiceImpl impl = new TableIdGnrServiceImpl();
		impl.setDataSource(dataSource);
		impl.setTable("CM_IDS");
		impl.setTableName("BBS_AUTHOR_ID");
		impl.setBlockSize(10);
		return impl;
	}

	/**
	 * CM_BBS_CATEGORY.CATEGORY_SQ (CM_IDS.TABLE_NAME = 'BBS_CATEGORY_ID', 숫자 시퀀스)
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl bbsCategoryIdGnrService() {
		TableIdGnrServiceImpl impl = new TableIdGnrServiceImpl();
		impl.setDataSource(dataSource);
		impl.setTable("CM_IDS");
		impl.setTableName("BBS_CATEGORY_ID");
		impl.setBlockSize(10);
		return impl;
	}

	/**
	 * CM_NTT_COMMENT.COMMENT_SQ (CM_IDS.TABLE_NAME = 'NTT_COMMENT_ID', 숫자 시퀀스)
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl nttCommentIdGnrService() {
		TableIdGnrServiceImpl impl = new TableIdGnrServiceImpl();
		impl.setDataSource(dataSource);
		impl.setTable("CM_IDS");
		impl.setTableName("NTT_COMMENT_ID");
		impl.setBlockSize(10);
		return impl;
	}

	/**
	 * CM_DASHBRD.DASHBRD_ID (CM_IDS.TABLE_NAME = 'DASHBRD_ID'). IdGnrBuilder + getNextStringId() 공통 경로.
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl dashbrdIdGnrService() {
		return new IdGnrBuilder().setDataSource(dataSource).setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DASHBRD_ID")
			.setPreFix("DASHBRD-")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	/**
	 * 첨부파일 ID Generation  Strategy Config
	 * @return
	 */
	private IdGnrStrategyImpl fileStrategy() {
		IdGnrStrategyImpl idGnrStrategyImpl = new IdGnrStrategyImpl();
		idGnrStrategyImpl.setPrefix("FILE_");
		idGnrStrategyImpl.setCipers(15);
		idGnrStrategyImpl.setFillChar('0');
		return idGnrStrategyImpl;
	}


	// 구현 방법 2: IdGnrStrategyImpl 사용시 사용 가능

	/**
	 * 게시판 ID (CM_IDS.TABLE_NAME = 'BBS_ID'). 예: BBS-00001 (하이픈 + 5자리).
	 * CM_BBS 게시판 ID 채번에 사용.
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBBSMstrIdGnrService() {
		return new IdGnrBuilder().setDataSource(dataSource).setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BBS_ID")
			.setPreFix("BBS-")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	//
	/** 게시판템플릿 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovTmplatIdGnrService() {
		return new IdGnrBuilder().setDataSource(dataSource).setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("TMPLAT_ID")
			.setPreFix("TMPLAT_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 부서일정 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl deptSchdulManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(dataSource).setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SCHDUL_ID")
			.setPreFix("SCHDUL_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 사용자조직구성원 MBRSH_SQ ID Generation (CM_USER_ORGNZT_MBRSH, CM_IDS 사용)
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovUserOrgnztMbrshIdGnrService() {
		TableIdGnrServiceImpl impl = new TableIdGnrServiceImpl();
		impl.setDataSource(dataSource);
		impl.setTable("CM_IDS");
		impl.setTableName("USER_ORGNZT_MBRSH_ID");
		impl.setBlockSize(10);
		return impl;
	}

	/** 위키북마크 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovWikiBookmarkIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("WIKI_ID")
			.setPreFix("WIKI")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 지식정보제공/지식정보요청 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovRequestOfferIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("KNO_ID2")
			.setPreFix("KNO_ID2")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** RSS관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovRssTagManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("RSS_ID")
			.setPreFix("RSS_ID")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 쪽지관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNoteManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NOTE_ID")
			.setPreFix("NOTE_ID")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 보낸쪽지함관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNoteTrnsmitIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NOTE_TRNSMIT_ID")
			.setPreFix("NOTE_TR")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 받은쪽지함관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNoteRecptnIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NOTE_RECPTN_ID")
			.setPreFix("NOTE_RE")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 시스템연계 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSystemCntcIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CNTC_ID")
			.setPreFix("CNTC")
			.setCipers(4)
			.setFillChar('0')
			.build();
	}

	/** 연계기관 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCntcInsttIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("INSTT_ID")
			.setPreFix("INS")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	/** 연계시스템 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCntcSystemIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SYS_ID")
			.setPreFix("SYS")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	/** 연계서비스 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCntcServiceIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SVC_ID")
			.setPreFix("SVC")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	/** 연계메시지 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCntcMessageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CNTC_MESSAGE_ID")
			.setPreFix("MSG")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 연계메시지항목 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCntcMessageItemIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ITEM_ID")
			.setPreFix("ITM")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 기관코드 수신 작업 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovInsttCodeRecptnIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("INSTT_CODE_OPERT")
			.build();
	}

	/** 행정코드 수신 작업 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovAdministCodeRecptnIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ADMIN_CODE_OPERT")
			.build();
	}

	/** 팝업창관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovPopupManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("POPUP_ID")
			.setPreFix("POPUP_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 최근검색어관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSrchwrdManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SRCHWRD_MANAGEID")
			.setPreFix("SRCMGR_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 최근검색어관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSrchwrdIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SRCHWRD_ID")
			.setPreFix("SRC_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 행정전문용어사전 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovAdministrationWordIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ADMINIST_WORD_ID")
			.setPreFix("ADMINIST_")
			.setCipers(11)
			.setFillChar('0')
			.build();
	}

	/** 개정정보보호정책확인 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovIndvdlInfoPolicyIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("INDVDL_INFO_ID")
			.setPreFix("INDVDL_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 통합링크 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovUnityLinkIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("UNITY_LINK_ID")
			.setPreFix("ULINK_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 온라인메뉴얼 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovOnlineMenualIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ONLINE_MUL_ID")
			.setPreFix("OMUL_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** 온라인POLL관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovOnlinePollManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("POLL_MGR_ID")
			.setPreFix("POLLMGR_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 온라인POLL항목 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovOnlinePollItemIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("POLL_IEM_ID")
			.setPreFix("POLLIEM_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 온라인POLL결과 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovOnlinePollResultIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("POLL_RUT_ID")
			.setPreFix("POLLRUT_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 삭제예정 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("ids")
			.setTableName("COMTNWORDDICARYINFO")
			.setPreFix("SAMPLE-")
			.setCipers(5)
			.setFillChar('0')
			.build();
	}

	/** 게시판용 NTT_ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNttIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NTT_ID")
			//.setPreFix("SAMPLE-") //TODO : 입력하지 않았을때 처리 필요
			.setCipers(20)
			.setFillChar('0')
			.build();
	}

	/** Clb ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovClbIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CLB_ID")
			.setPreFix("CLB_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 커뮤니티 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCmmntyIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CMMNTY_ID")
			.setPreFix("CMMNTY_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 커뮤니티 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovUsrCnfrmIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("USRCNFRM_ID")
			.setPreFix("USRCNFRM_")
			.setCipers(11)
			.setFillChar('0')
			.build();
	}

	/** 메일 메세지 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMailMsgIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("MAILMSG_ID")
			.setPreFix("MAILMSG_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** RestDe NTT_ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovRestDeIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("RESTDE_ID")
			.build();
	}

	/** WordDicary ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovWordDicaryIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("WORD_ID")
			.setPreFix("WORDDICARY_")
			.setCipers(9)
			.setFillChar('0')
			.build();
	}

	/** 회의관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMgtIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("MTG_ID")
			.setPreFix("MTG_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 행사/이벤트/켐페인 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovEventInfoIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("EVENTINFO_ID")
			.setPreFix("EVENT_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 외부인사정보 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovExtrlhrInfoIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("EXTRLHRINFO_ID")
			.setPreFix("EXTRLHR_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 설문템플릿 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovQustnrTmplatManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QUSTNRTMPLA_ID")
			.setPreFix("QTMPLA_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 설문관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovQustnrManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QUSTNRTMPLA_ID")
			.setPreFix("QMANAGE_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 설문문항 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovQustnrQestnManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QUSTNRQESTN_ID")
			.setPreFix("QQESTN_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 설문항목 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovQustnrItemManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QESTNR_QESITM_ID")
			.setPreFix("QESITM_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 설문응답자정보 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl qustnrRespondManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QESTNR_RPD_ID")
			.setPreFix("QRPD_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** 설문조사 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl qustnrRespondInfoIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QESRSPNS_ID")
			.setPreFix("QRSPNS_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 일정관리 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl diaryManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DIARY_ID")
			.setPreFix("DIARY_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** SiteManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSiteManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SITE_ID")
			.setPreFix("SITE_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** RecomendSiteManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovRecomendSiteManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("RECOMEND_SITE_ID")
			.setPreFix("RECOMEND_")
			.setCipers(11)
			.setFillChar('0')
			.build();
	}

	/** HPCMManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovHpcmManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("HPCM_ID")
			.setPreFix("HPCM_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** NewsManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovFaqManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("FAQ_ID")
			.setPreFix("FAQ_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** FaqManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNewsManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NEWS_ID")
			.setPreFix("NEWS_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** 명함 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNcrdIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NCRD_ID")
			.setPreFix("NCRD_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** 주소록 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovAdbkIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ADBK_ID")
			.setPreFix("ADBK_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** AdbkUser ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovAdbkUserIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ADBKUSER_ID")
			.setPreFix("ADBKUSER_")
			.setCipers(11)
			.setFillChar('0')
			.build();
	}

	/** 그룹 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovGroupIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("GROUP_ID")
			.setPreFix("GROUP_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 롤 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovRoleIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ROLE_ID")
			.setPreFix("")
			.setCipers(6)
			.setFillChar('0')
			.build();
	}

	/** StplatManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovStplatManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("USE_STPLAT_ID")
			.setPreFix("STPLAT_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** CpyrhtPrtcPolicy ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCpyrhtPrtcPolicyIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CPYRHT_ID")
			.setPreFix("CPYRHT_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** Qna ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovQnaManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("QA_ID")
			.setPreFix("QA_")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** Cnslt ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCnsltManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CNSLT_ID")
			.setPreFix("CNSLT_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** Login ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovLoginLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("LOGINLOG_ID")
			.setPreFix("LOGIN_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** System Log ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSysLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SYSLOG_ID")
			.setPreFix("SYSLOG_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** Web Log. ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovWebLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("WEBLOG_ID")
			.setPreFix("WEBLOG_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** Trsmrcv. ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovTrsmrcvLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("TRSMRCVLOG_ID")
			.setPreFix("TRSMRCV_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 배너. ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBannerIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BANNER_ID")
			.setPreFix("BANNER_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 로그인화면이미지. ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovLoginScrinImageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("LSI_ID")
			.setPreFix("LSI_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 메인화면이미지. ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMainImageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("MSI_ID")
			.setPreFix("MSI_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 인터넷서비스안내 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovIntnetSvcGuidanceIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ISG_ID")
			.setPreFix("ISG_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 마이페이지 컨텐츠 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovIndvdlPgeIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CNTNTS_ID")
			.setPreFix("C")
			.setCipers(19)
			.setFillChar('0')
			.build();
	}

	/** 보고서통계 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovReprtStatsIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("RS_ID")
			.setPreFix("RS_")
			.setCipers(3)
			.setFillChar('0')
			.build();
	}

	/** 자료이용현황통계 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovDtaUseStatsIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DUS_ID")
			.setPreFix("DUS_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 자료이용현황통계 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSmsIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SMS_ID")
			.setPreFix("SMS_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** Scrap ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovScrapIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SCRAP_ID")
			.setPreFix("SCRIP_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 부서 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovDeptManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ORGNZT_ID")
			.setPreFix("ORGNZT_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** 네트워크 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNtwrkIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NTWRK_ID")
			.setPreFix("NID_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 서버장비 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovServerEqpmnIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SEVEQ_ID")
			.setPreFix("SVE_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 서버 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovServerIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SERVER_ID")
			.setPreFix("SRV_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 장애 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovTroblIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("TROBL_ID")
			.setPreFix("TBM_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 동기화대상 서버 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovSynchrnServerIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SYNCHRNSERVER_ID")
			.setPreFix("SSY_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 회의실관리 서버 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMtgPlaceManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("MTG_PLACE_ID")
			.setPreFix("MTGP_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** 회의실예약 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMtgPlaceResveIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("RESVE_ID")
			.setPreFix("RESVE_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 행사 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovEventManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("EVENT_ID")
			.setPreFix("EVENT_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 행사접수 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovEventAtdrnIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("APPLCNT_ID")
			.setPreFix("APPLCNT_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 포상 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovRwardManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("RWARD_ID")
			.setPreFix("RWARD_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 경조사 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovCtsnnManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("CTSNN_ID")
			.setPreFix("RWARD_")
			.setCipers(14)
			.setFillChar('0')
			.build();
	}

	/** 기념일 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovAnnvrsryManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("ANN_ID")
			.setPreFix("ANN_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 간부일정 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovLeaderSchdulIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("LEADER_SCHDUL_ID")
			.setPreFix("LDSCHDUL_")
			.setCipers(11)
			.setFillChar('0')
			.build();
	}

	/** 부서업무함 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovDeptJobBxIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DEPT_JOB_BX_ID")
			.setPreFix("DX_")
			.setCipers(3)
			.setFillChar('0')
			.build();
	}

	/** 부서업무 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovDeptJobIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DEPT_JOB_ID")
			.setPreFix("DEPTJOB_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 주간/월간 보고  ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovWikMnthngReprtIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("WIKMNTHNG_REPRT")
			.setPreFix("WR")
			.setCipers(4)
			.setFillChar('0')
			.build();
	}

	/** 메모 할일  ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMemoTodoIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("MEMO_TODO_ID")
			.setPreFix("MEMOTODO_")
			.setCipers(11)
			.setFillChar('0')
			.build();
	}

	/** 메모 보고  ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovMemoReprtIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("MEMO_REPRT")
			.setPreFix("MR")
			.setCipers(4)
			.setFillChar('0')
			.build();
	}

	/** 약식 결재   ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovInfrmlSanctnIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("INFRML_SANCTN")
			.setPreFix("SANCTN_")
			.setCipers(13)
			.setFillChar('0')
			.build();
	}

	/** DB서비스모니터링   ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovDbMntrngLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DB_MNTRNG_LOG_ID")
			.setPreFix("")
			.setCipers(20)
			.setFillChar('0')
			.build();
	}

	/** DB송수신모니터링   ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovTrsmrcvMntrngLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("TR_MNTRNG_LOG_ID")
			.setPreFix("")
			.setCipers(20)
			.setFillChar('0')
			.build();
	}

	/** 배치작업 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBatchOpertIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BATCH_OPERT_ID")
			.setPreFix("BAT")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 배치스케줄  ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBatchSchdulIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BATCH_SCHDUL_ID")
			.setPreFix("BSC")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 배치결과 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBatchResultIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BATCH_RESULT_ID")
			.setPreFix("BRT")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 파일시스템모니터링 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovFileSysMntrngIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("FILESYS_MNTRNG")
			.setPreFix("FILESYS_")
			.setCipers(12)
			.setFillChar('0')
			.build();
	}

	/** 네트워크서비스모니터링 로그 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovNtwrkSvcMntrngLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("NTWRKSVC_LOGID")
			.setPreFix("")
			.setCipers(20)
			.setFillChar('0')
			.build();
	}

	/** 파일시스템모니터링 로그 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovFileSysMntrngLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("FILESYS_LOGID")
			.setPreFix("")
			.setCipers(20)
			.setFillChar('0')
			.build();
	}

	/** 프록시서비스 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovProxySvcIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("PROXYSVC_ID")
			.setPreFix("PXY_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** 프록시Log ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovProxyLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("PROXYLOG_ID")
			.setPreFix("PLG_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** knoManage ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovDamManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("DAM_ID")
			.setPreFix("DMID_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** 백업작업 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBackupOpertIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BACKUP_OPERT_ID")
			.setPreFix("BAK")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 백업결과 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovBackupResultIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("BACKUP_RESULT_ID")
			.setPreFix("BRT")
			.setCipers(17)
			.setFillChar('0')
			.build();
	}

	/** 서버자원 모니터링 ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovServerResrceMntrngLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("SVCRESMONTLOG_ID")
			.setPreFix("LOG_")
			.setCipers(16)
			.setFillChar('0')
			.build();
	}

	/** HttpMon ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovHttpManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("HTTP_ID")
			.setPreFix("HTTP_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** HttpMonLog ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovHttpLogManageIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("HTTL_ID")
			.setPreFix("HTTL_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** HttpMonLog ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovProcessMonIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("PROC_ID")
			.setPreFix("PROC_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

	/** ProcessMonLog ID Generation  Config
	 * @return
	 */
	@Bean(destroyMethod = "destroy")
	public TableIdGnrServiceImpl egovProcessMonLogIdGnrService() {
		return new IdGnrBuilder().setDataSource(egovDataSource)
			.setIdGnrStrategyImpl(new IdGnrStrategyImpl())
			.setBlockSize(10)
			.setTable("CM_IDS")
			.setTableName("PROL_ID")
			.setPreFix("PROL_")
			.setCipers(15)
			.setFillChar('0')
			.build();
	}

}
