package tvframework.sym.pgm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 프로그램 관리 요청 DTO (등록/수정용)
 * 테이블 컬럼 기준 카멜(progrmFileNm 등) 사용. API/프론트와 동일 키 사용.
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnProgramRequestDTO {

    /** CMPNY_CD - 회사코드 (PK) */
    private String cmpnyCd;
    /** PROGRM_FILE_NM - 프로그램 ID(파일명) (PK) */
    private String progrmFileNm;
    /** PROGRM_STRE_PATH - 프로그램 저장 경로 */
    private String progrmStrePath;
    /** PROGRM_NM_CODE - 프로그램명 코드 */
    private String progrmNmCode;
    /** PROGRM_URL - 프로그램 URL */
    private String progrmUrl;
    /** PROGRM_DC - 프로그램 설명 */
    private String progrmDc;
    /** USE_FL - 사용 여부 (기본 Y) */
    private String useFl;
}
