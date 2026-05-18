package tvframework.sym.grp.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 그룹 정보 DTO (테이블: CM_GROUP)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnGroupDTO {

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
    /** 생성자아이디 */
    private String creationId;
    /** 생성일자 */
    private String creationDt;
    /** 업데이트아이디 */
    private String updateId;
    /** 업데이트일자 */
    private String updateDt;
    /** 회사명 (조인) */
    private String cmpnyNm;
}
