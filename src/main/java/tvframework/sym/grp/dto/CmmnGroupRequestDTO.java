package tvframework.sym.grp.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/**
 * 그룹 등록/수정 요청 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnGroupRequestDTO {

    /** 회사코드 */
    private String cmpnyCd;
    /** 그룹ID */
    private String groupId;
    /** 그룹명 */
    private String groupNm;
    /** 그룹영문명 */
    private String groupEngNm;
    /** 그룹설명 */
    private String groupCn;
    /** 사용여부 */
    private String useFl;
    /** 그룹 사용자 구성원번호 목록 (MBRSH_SQ) */
    private List<Long> mbrshSqList;
}
