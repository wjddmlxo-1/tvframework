package tvframework.man.service;

import java.util.List;

import tvframework.man.dto.BbsUserBoardDTO;
import tvframework.man.dto.BbsUserCategoryDTO;
import tvframework.man.dto.BbsUserCommentDTO;
import tvframework.man.dto.BbsUserCommentSaveDTO;
import tvframework.man.dto.BbsUserFileBinaryDTO;
import tvframework.man.dto.BbsUserFileUploadDTO;
import tvframework.man.dto.BbsUserNttPageDTO;
import tvframework.man.dto.BbsUserPopupNoticeDTO;
import tvframework.man.dto.BbsUserPopupPreviewDTO;
import tvframework.man.dto.BbsUserPopupSettingDTO;
import tvframework.man.dto.BbsUserPostSaveDTO;
import tvframework.man.dto.BbsUserPostFileBindDTO;
import tvframework.man.dto.BbsUserPostFileDTO;
import tvframework.man.dto.BbsUserPostDetailDTO;

public interface BbsUserService {

    List<BbsUserBoardDTO> selectBoardsForUser(String cmpnyCd, String userId, String languageCode) throws Exception;

    BbsUserNttPageDTO selectNttPage(String cmpnyCd, String userId, String languageCode,
        String bbsId, int pageIndex, int pageSize, boolean sortAsc) throws Exception;

    BbsUserPostDetailDTO selectPostDetail(String cmpnyCd, String userId, String languageCode,
        String bbsId, String nttSq) throws Exception;

    void updatePost(BbsUserPostSaveDTO dto, String userId) throws Exception;

    void deletePost(String cmpnyCd, String bbsId, String nttSq, String userId) throws Exception;

    void markPostRead(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    void togglePostVote(String nttSq, String bbsId, String cmpnyCd, String voteGb, String userId) throws Exception;

    void togglePostFavorite(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception;

    List<BbsUserCommentDTO> selectComments(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception;

    void createComment(BbsUserCommentSaveDTO dto, String userId) throws Exception;

    void updateComment(BbsUserCommentSaveDTO dto, String userId) throws Exception;

    void deleteComment(BbsUserCommentSaveDTO dto, String userId) throws Exception;

    List<BbsUserPopupNoticeDTO> selectPopupNoticeList(String cmpnyCd, String userId, String languageCode, String bbsId) throws Exception;

    BbsUserPopupPreviewDTO selectPopupPreview(String cmpnyCd, String userId, String languageCode,
        String popupSq, String bbsId, String nttSq) throws Exception;

    BbsUserPopupSettingDTO selectPopupSetting(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception;

    BbsUserPopupSettingDTO savePopupSetting(BbsUserPopupSettingDTO dto, String userId) throws Exception;

    void deletePopupSetting(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception;

    List<BbsUserCategoryDTO> selectCategoriesForUser(String cmpnyCd, String userId, String bbsId) throws Exception;

    String createPost(BbsUserPostSaveDTO dto, String userId) throws Exception;

    BbsUserFileUploadDTO savePostFileData(byte[] data, String fileName, String mimeType, String userId) throws Exception;

    BbsUserFileBinaryDTO loadPostFile(String fileSq) throws Exception;

    BbsUserFileUploadDTO saveCommentFileData(byte[] data, String fileName, String mimeType, String userId) throws Exception;

    BbsUserFileBinaryDTO loadCommentFile(String fileSq) throws Exception;

    BbsUserFileBinaryDTO loadProfileFile(String fileSq) throws Exception;

    /** 프로필 사진 업로드(CM_FILE FILE_TY=PROFILE) */
    BbsUserFileUploadDTO saveProfileFileData(byte[] data, String fileName, String mimeType, String userId) throws Exception;

    void bindPostFiles(BbsUserPostFileBindDTO dto, String userId) throws Exception;

    List<BbsUserPostFileDTO> selectPostFiles(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception;
}
