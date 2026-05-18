package tvframework.man.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.man.dto.BbsUserBoardDTO;
import tvframework.man.dto.BbsUserBoardPermDTO;
import tvframework.man.dto.BbsUserCategoryDTO;
import tvframework.man.dto.BbsUserCommentAttachmentRowDTO;
import tvframework.man.dto.BbsUserCommentDTO;
import tvframework.man.dto.BbsUserFileBinaryDTO;
import tvframework.man.dto.BbsUserNttDTO;
import tvframework.man.dto.BbsUserOrgDTO;
import tvframework.man.dto.BbsUserPopupNoticeDTO;
import tvframework.man.dto.BbsUserPopupPreviewDTO;
import tvframework.man.dto.BbsUserPopupSettingDTO;
import tvframework.man.dto.BbsUserBbsFeaturesDTO;
import tvframework.man.dto.BbsUserPostFileDTO;
import tvframework.man.dto.BbsUserPostDetailDTO;

@Repository("bbsUserMapper")
public class BbsUserMapper extends AbstractMapper {

    private static final String NS = "tvframework.man.service.impl.BbsUserMapper.";

    public BbsUserOrgDTO selectUserOrgMembership(Map<String, Object> params) {
        return selectOne(NS + "selectUserOrgMembership", params);
    }

    public List<String> selectAccessibleBbsIds(Map<String, Object> params) {
        return selectList(NS + "selectAccessibleBbsIds", params);
    }

    public List<BbsUserBoardDTO> selectBoardsForUser(Map<String, Object> params) {
        return selectList(NS + "selectBoardsForUser", params);
    }

    public int countNttList(Map<String, Object> params) {
        Integer n = selectOne(NS + "countNttList", params);
        return n != null ? n : 0;
    }

    public List<BbsUserNttDTO> selectNttList(Map<String, Object> params) {
        return selectList(NS + "selectNttList", params);
    }

    public BbsUserPostDetailDTO selectPostDetail(Map<String, Object> params) {
        return selectOne(NS + "selectPostDetail", params);
    }

    public BbsUserBoardPermDTO selectBbsAuthorAggFlags(Map<String, Object> params) {
        return selectOne(NS + "selectBbsAuthorAggFlags", params);
    }

    public int updateUserPost(Map<String, Object> params) {
        return update(NS + "updateUserPost", params);
    }

    public int softDeleteUserPost(Map<String, Object> params) {
        return update(NS + "softDeleteUserPost", params);
    }

    public int softDeletePostAttachedFiles(Map<String, Object> params) {
        return update(NS + "softDeletePostAttachedFiles", params);
    }

    public void updatePostCounts(Map<String, Object> params) {
        update(NS + "updatePostCounts", params);
    }

    public void insertPostRead(Map<String, Object> params) {
        insert(NS + "insertPostRead", params);
    }

    public int countPostVote(Map<String, Object> params) {
        Integer n = selectOne(NS + "countPostVote", params);
        return n != null ? n : 0;
    }

    public int countPostFavorite(Map<String, Object> params) {
        Integer n = selectOne(NS + "countPostFavorite", params);
        return n != null ? n : 0;
    }

    public void insertPostVote(Map<String, Object> params) {
        insert(NS + "insertPostVote", params);
    }

    public void deletePostVote(Map<String, Object> params) {
        delete(NS + "deletePostVote", params);
    }

    public void insertPostFavorite(Map<String, Object> params) {
        insert(NS + "insertPostFavorite", params);
    }

    public void deletePostFavorite(Map<String, Object> params) {
        delete(NS + "deletePostFavorite", params);
    }

    public List<BbsUserCommentDTO> selectCommentList(Map<String, Object> params) {
        return selectList(NS + "selectCommentList", params);
    }

    public String selectCommentSecretFl(Map<String, Object> params) {
        return selectOne(NS + "selectCommentSecretFl", params);
    }

    public Map<String, Object> selectCommentThreadInfo(Map<String, Object> params) {
        return selectOne(NS + "selectCommentThreadInfo", params);
    }

    public int selectMaxCommentOrderNoByGroup(Map<String, Object> params) {
        Integer n = selectOne(NS + "selectMaxCommentOrderNoByGroup", params);
        return n != null ? n : 0;
    }

    public void insertComment(Map<String, Object> params) {
        insert(NS + "insertComment", params);
    }

    public int countCommentOwner(Map<String, Object> params) {
        Integer n = selectOne(NS + "countCommentOwner", params);
        return n != null ? n : 0;
    }

    public void updateComment(Map<String, Object> params) {
        update(NS + "updateComment", params);
    }

    public void deleteComment(Map<String, Object> params) {
        update(NS + "deleteComment", params);
    }

    public List<BbsUserPopupNoticeDTO> selectPopupNoticeListForUser(Map<String, Object> params) {
        return selectList(NS + "selectPopupNoticeListForUser", params);
    }

    public BbsUserPopupPreviewDTO selectPopupPreviewForUser(Map<String, Object> params) {
        return selectOne(NS + "selectPopupPreviewForUser", params);
    }

    public BbsUserPopupSettingDTO selectPopupSettingByPostForUser(Map<String, Object> params) {
        return selectOne(NS + "selectPopupSettingByPostForUser", params);
    }

    public int insertPopupSettingByPostForUser(Map<String, Object> params) {
        return insert(NS + "insertPopupSettingByPostForUser", params);
    }

    public int updatePopupSettingByPostForUser(Map<String, Object> params) {
        return update(NS + "updatePopupSettingByPostForUser", params);
    }

    public int deletePopupSettingByPostForUser(Map<String, Object> params) {
        return delete(NS + "deletePopupSettingByPostForUser", params);
    }

    public List<BbsUserCategoryDTO> selectCategoriesForUser(Map<String, Object> params) {
        return selectList(NS + "selectCategoriesForUser", params);
    }

    public void insertPost(Map<String, Object> params) {
        insert(NS + "insertPost", params);
    }

    public Map<String, Object> selectPostThreadInfo(Map<String, Object> params) {
        return selectOne(NS + "selectPostThreadInfo", params);
    }

    public int selectMaxPostOrderNoByGroup(Map<String, Object> params) {
        Integer n = selectOne(NS + "selectMaxPostOrderNoByGroup", params);
        return n != null ? n : 0;
    }

    public void insertCmFilePostData(Map<String, Object> params) {
        insert(NS + "insertCmFilePostData", params);
    }

    public BbsUserFileBinaryDTO selectCmFilePostData(Map<String, Object> params) {
        return selectOne(NS + "selectCmFilePostData", params);
    }

    public void updatePostFilesRefSq(Map<String, Object> params) {
        update(NS + "updatePostFilesRefSq", params);
    }

    public void softDeletePostFilesForPost(Map<String, Object> params) {
        update(NS + "softDeletePostFilesForPost", params);
    }

    public void softDeletePostFilesForPostNotIn(Map<String, Object> params) {
        update(NS + "softDeletePostFilesForPostNotIn", params);
    }

    public List<BbsUserPostFileDTO> selectPostFiles(Map<String, Object> params) {
        return selectList(NS + "selectPostFiles", params);
    }

    public String selectBbsLayoutTy(Map<String, Object> params) {
        return selectOne(NS + "selectBbsLayoutTy", params);
    }

    public BbsUserBbsFeaturesDTO selectBbsFeatureFlags(Map<String, Object> params) {
        return selectOne(NS + "selectBbsFeatureFlags", params);
    }

    public int countImageFilesAmongSqs(Map<String, Object> params) {
        Integer n = selectOne(NS + "countImageFilesAmongSqs", params);
        return n != null ? n : 0;
    }

    public void insertCmFileCommentData(Map<String, Object> params) {
        insert(NS + "insertCmFileCommentData", params);
    }

    public BbsUserFileBinaryDTO selectCmFileCommentData(Map<String, Object> params) {
        return selectOne(NS + "selectCmFileCommentData", params);
    }

    public void insertCmFileProfileData(Map<String, Object> params) {
        insert(NS + "insertCmFileProfileData", params);
    }

    public BbsUserFileBinaryDTO selectCmFileProfileData(Map<String, Object> params) {
        return selectOne(NS + "selectCmFileProfileData", params);
    }

    public void updateCommentFilesRefSq(Map<String, Object> params) {
        update(NS + "updateCommentFilesRefSq", params);
    }

    public List<BbsUserCommentAttachmentRowDTO> selectCommentAttachmentsForNtt(Map<String, Object> params) {
        return selectList(NS + "selectCommentAttachmentsForNtt", params);
    }

    public int countImageCommentFilesAmongSqs(Map<String, Object> params) {
        Integer n = selectOne(NS + "countImageCommentFilesAmongSqs", params);
        return n != null ? n : 0;
    }

    public long sumCommentFileBytesAmongSqs(Map<String, Object> params) {
        Number n = selectOne(NS + "sumCommentFileBytesAmongSqs", params);
        return n != null ? n.longValue() : 0L;
    }

    public void softDeleteCommentFilesForComment(Map<String, Object> params) {
        update(NS + "softDeleteCommentFilesForComment", params);
    }

    public void softDeleteCommentFilesForCommentNotIn(Map<String, Object> params) {
        update(NS + "softDeleteCommentFilesForCommentNotIn", params);
    }
}
