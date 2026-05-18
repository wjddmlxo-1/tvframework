package tvframework.sym.pgm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 프로그램 관리 DTO (조회/목록용)
 * 테이블 컬럼 기준 카멜(progrmFileNm 등) 사용. API/프론트와 동일 키 사용.
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnProgramDTO {

    /** CMPNY_CD - 회사코드 (PK) */
    private String cmpnyCd;
    /** PROGRM_FILE_NM - 프로그램 ID(파일명) (PK) */
    private String progrmFileNm;
    /** PROGRM_STRE_PATH - 프로그램 저장 경로 */
    private String progrmStrePath;
    /** PROGRM_NM_CODE - 프로그램명 코드 */
    private String progrmNmCode;
    /** MESSAGE_CN - 프로그램명 (다국어 메시지, 목록 조회 시 LEFT JOIN 결과) */
    private String messageCn;
    /** PROGRM_URL - 프로그램 URL */
    private String progrmUrl;
    /** PROGRM_DC - 프로그램 설명 */
    private String progrmDc;
    /** USE_FL - 사용 여부 */
    private String useFl;
    /** CREATION_ID - 등록자 ID */
    private String creationId;
    /** CREATION_DT - 등록 일시 */
    private String creationDt;
    /** UPDATE_ID - 수정자 ID */
    private String updateId;
    /** UPDATE_DT - 수정 일시 */
    private String updateDt;
}
