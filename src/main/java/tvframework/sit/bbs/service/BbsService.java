package tvframework.sit.bbs.service;

import java.util.List;

import tvframework.sit.bbs.dto.BbsCodeDetailOptionDTO;
import tvframework.sit.bbs.dto.BbsCommentPendingDTO;
import tvframework.sit.bbs.dto.BbsDTO;
import tvframework.sit.bbs.dto.BbsNttTrashDTO;
import tvframework.sit.bbs.dto.BbsPopupNoticeDTO;
import tvframework.sit.bbs.dto.BbsPopupPreviewDTO;
import tvframework.sit.bbs.dto.BbsPopupSettingDTO;
import tvframework.sit.bbs.dto.BbsSortRequestDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 사이트 게시판 관리 서비스
 */
public interface BbsService {

    List<CodeOptionDTO> selectBbsTypeOptions(String cmpnyCd, String languageCode) throws Exception;

    List<CodeOptionDTO> selectLayoutTypeOptions(String cmpnyCd, String languageCode) throws Exception;

    /** 게시판 유형(CODE_ID)에 따른 기능 활성화용 공통코드 상세 목록 */
    List<BbsCodeDetailOptionDTO> selectBbsFeatureCodeOptions(String cmpnyCd, String bbsTyCodeId, String languageCode) throws Exception;

    List<BbsDTO> selectBbsList(String cmpnyCd, String bbsTy, String searchKeyword, String languageCode) throws Exception;

    BbsDTO selectBbsDetail(String bbsId, String cmpnyCd, String languageCode) throws Exception;

    String selectNextBbsId() throws Exception;

    void insertBbs(BbsDTO dto, String userId) throws Exception;

    void updateBbs(BbsDTO dto, String userId) throws Exception;

    void deleteBbs(String bbsId, String cmpnyCd, String userId) throws Exception;

    void updateBbsSortOrder(BbsSortRequestDTO req, String userId) throws Exception;

    List<BbsNttTrashDTO> selectTrashList(String bbsId, String cmpnyCd) throws Exception;

    void restoreTrashNtt(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    void purgeTrashNtt(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    void restoreAllTrash(String bbsId, String cmpnyCd, String userId) throws Exception;

    void purgeAllTrash(String bbsId, String cmpnyCd, String userId) throws Exception;

    List<BbsCommentPendingDTO> selectPendingComments(String bbsId, String cmpnyCd) throws Exception;

    void approveComment(String commentSq, String nttSq, String mbrshSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    void rejectComment(String commentSq, String nttSq, String mbrshSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    void approveAllComments(String bbsId, String cmpnyCd, String userId) throws Exception;

    void rejectAllComments(String bbsId, String cmpnyCd, String userId) throws Exception;

    List<BbsPopupNoticeDTO> selectPopupNoticeList(String cmpnyCd, String languageCode) throws Exception;

    BbsPopupSettingDTO selectPopupSetting(String popupSq, String nttSq, String bbsId, String cmpnyCd) throws Exception;

    void updatePopupSetting(BbsPopupSettingDTO dto, String userId) throws Exception;

    void deletePopupNotice(String popupSq, String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    BbsPopupPreviewDTO selectPopupPreview(String popupSq, String nttSq, String bbsId, String cmpnyCd, String languageCode, String userId) throws Exception;

    void markPopupPreviewRead(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    void togglePopupPreviewVote(String nttSq, String bbsId, String cmpnyCd, String voteGb, String userId) throws Exception;

    void togglePopupPreviewFavorite(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

}
