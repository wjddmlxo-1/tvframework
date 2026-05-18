package tvframework.sit.bbs.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sit.bbs.dto.BbsAuthorDTO;
import tvframework.sit.bbs.dto.BbsCategoryDTO;
import tvframework.sit.bbs.dto.BbsCodeDetailOptionDTO;
import tvframework.sit.bbs.dto.BbsCommentPendingDTO;
import tvframework.sit.bbs.dto.BbsDTO;
import tvframework.sit.bbs.dto.BbsNttTrashDTO;
import tvframework.sit.bbs.dto.BbsPopupNoticeDTO;
import tvframework.sit.bbs.dto.BbsPopupPreviewDTO;
import tvframework.sit.bbs.dto.BbsPopupSettingDTO;

/**
 * 게시판 MyBatis Mapper
 */
@Repository("bbsMapper")
public class BbsMapper extends AbstractMapper {

    @SuppressWarnings("unchecked")
    public List<BbsDTO> selectBbsList(Map<String, Object> params) {
        return selectList("BbsMapper.selectBbsList", params);
    }

    public BbsDTO selectBbsDetail(Map<String, Object> params) {
        return selectOne("BbsMapper.selectBbsDetail", params);
    }

    public int selectMaxSortingSq(Map<String, Object> params) {
        Integer n = selectOne("BbsMapper.selectMaxSortingSq", params);
        return n != null ? n : 0;
    }

    public int countNttByBbs(Map<String, Object> params) {
        Integer n = selectOne("BbsMapper.countNttByBbs", params);
        return n != null ? n : 0;
    }

    public int countCommentByBbs(Map<String, Object> params) {
        Integer n = selectOne("BbsMapper.countCommentByBbs", params);
        return n != null ? n : 0;
    }

    /** 휴지통 탭 뱃지 색상용: 건수 > 0 이면 'ORANGE', 아니면 null */
    public String selectTrashTabStatusColor(Map<String, Object> params) {
        return selectOne("BbsMapper.selectTrashTabStatusColor", params);
    }

    /** 댓글승인 탭 뱃지: 미승인 댓글 있으면 'ORANGE', 아니면 null */
    public String selectCommentTabStatusColor(Map<String, Object> params) {
        return selectOne("BbsMapper.selectCommentTabStatusColor", params);
    }

    public void insertBbs(Map<String, Object> params) {
        insert("BbsMapper.insertBbs", params);
    }

    public void updateBbs(Map<String, Object> params) {
        update("BbsMapper.updateBbs", params);
    }

    public void deleteBbs(Map<String, Object> params) {
        delete("BbsMapper.deleteBbs", params);
    }

    public void updateBbsSorting(Map<String, Object> params) {
        update("BbsMapper.updateBbsSorting", params);
    }

    @SuppressWarnings("unchecked")
    public List<BbsCategoryDTO> selectBbsCategories(Map<String, Object> params) {
        return selectList("BbsMapper.selectBbsCategories", params);
    }

    public void deleteBbsCategoriesByBoard(Map<String, Object> params) {
        delete("BbsMapper.deleteBbsCategoriesByBoard", params);
    }

    public void insertBbsCategory(Map<String, Object> params) {
        insert("BbsMapper.insertBbsCategory", params);
    }

    public void updateBbsCategory(Map<String, Object> params) {
        update("BbsMapper.updateBbsCategory", params);
    }

    public void deleteBbsCategory(Map<String, Object> params) {
        delete("BbsMapper.deleteBbsCategory", params);
    }

    @SuppressWarnings("unchecked")
    public List<BbsAuthorDTO> selectBbsAuthors(Map<String, Object> params) {
        return selectList("BbsMapper.selectBbsAuthors", params);
    }

    public void deleteBbsAuthorsByBoard(Map<String, Object> params) {
        delete("BbsMapper.deleteBbsAuthorsByBoard", params);
    }

    public void insertBbsAuthor(Map<String, Object> params) {
        insert("BbsMapper.insertBbsAuthor", params);
    }

    public void updateBbsAuthor(Map<String, Object> params) {
        update("BbsMapper.updateBbsAuthor", params);
    }

    public void deleteBbsAuthor(Map<String, Object> params) {
        delete("BbsMapper.deleteBbsAuthor", params);
    }

    @SuppressWarnings("unchecked")
    public List<BbsNttTrashDTO> selectTrashNttList(Map<String, Object> params) {
        return selectList("BbsMapper.selectTrashNttList", params);
    }

    public void restoreTrashNtt(Map<String, Object> params) {
        update("BbsMapper.restoreTrashNtt", params);
    }

    public void purgeTrashNtt(Map<String, Object> params) {
        update("BbsMapper.purgeTrashNtt", params);
    }

    public void restoreAllTrashNtt(Map<String, Object> params) {
        update("BbsMapper.restoreAllTrashNtt", params);
    }

    public void purgeAllTrashNtt(Map<String, Object> params) {
        update("BbsMapper.purgeAllTrashNtt", params);
    }

    @SuppressWarnings("unchecked")
    public List<BbsCommentPendingDTO> selectPendingComments(Map<String, Object> params) {
        return selectList("BbsMapper.selectPendingComments", params);
    }

    public void approveComment(Map<String, Object> params) {
        update("BbsMapper.approveComment", params);
    }

    public void rejectComment(Map<String, Object> params) {
        update("BbsMapper.rejectComment", params);
    }

    public void approveAllPendingComments(Map<String, Object> params) {
        update("BbsMapper.approveAllPendingComments", params);
    }

    public void rejectAllPendingComments(Map<String, Object> params) {
        update("BbsMapper.rejectAllPendingComments", params);
    }

    @SuppressWarnings("unchecked")
    public List<BbsPopupNoticeDTO> selectPopupNoticeList(Map<String, Object> params) {
        return selectList("BbsMapper.selectPopupNoticeList", params);
    }

    public BbsPopupSettingDTO selectPopupSetting(Map<String, Object> params) {
        return selectOne("BbsMapper.selectPopupSetting", params);
    }

    public void updatePopupSetting(Map<String, Object> params) {
        update("BbsMapper.updatePopupSetting", params);
    }

    public void deletePopupNotice(Map<String, Object> params) {
        delete("BbsMapper.deletePopupNotice", params);
    }

    public BbsPopupPreviewDTO selectPopupPreview(Map<String, Object> params) {
        return selectOne("BbsMapper.selectPopupPreview", params);
    }

    public void insertPopupPreviewRead(Map<String, Object> params) {
        insert("BbsMapper.insertPopupPreviewRead", params);
    }

    public int countPopupPreviewVote(Map<String, Object> params) {
        Integer n = selectOne("BbsMapper.countPopupPreviewVote", params);
        return n != null ? n : 0;
    }

    public void insertPopupPreviewVote(Map<String, Object> params) {
        insert("BbsMapper.insertPopupPreviewVote", params);
    }

    public void deletePopupPreviewVote(Map<String, Object> params) {
        delete("BbsMapper.deletePopupPreviewVote", params);
    }

    public int countPopupPreviewFavorite(Map<String, Object> params) {
        Integer n = selectOne("BbsMapper.countPopupPreviewFavorite", params);
        return n != null ? n : 0;
    }

    public void insertPopupPreviewFavorite(Map<String, Object> params) {
        insert("BbsMapper.insertPopupPreviewFavorite", params);
    }

    public void deletePopupPreviewFavorite(Map<String, Object> params) {
        delete("BbsMapper.deletePopupPreviewFavorite", params);
    }

    public void updatePopupPreviewCounts(Map<String, Object> params) {
        update("BbsMapper.updatePopupPreviewCounts", params);
    }

    @SuppressWarnings("unchecked")
    public List<BbsCodeDetailOptionDTO> selectBbsCodeDetailOptions(Map<String, Object> params) {
        return selectList("BbsMapper.selectBbsCodeDetailOptions", params);
    }

}
