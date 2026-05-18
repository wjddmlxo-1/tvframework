package tvframework.sym.cmm.exception;

import lombok.Getter;

/**
 * 공통코드 PK 중복 시 사용 (CM_CODE: CMPNY_CD+CODE_ID, CM_CODE_DETAIL: CMPNY_CD+CODE_ID+DETAIL_CODE_ID)
 */
@Getter
public class CmmnCodeDuplicateKeyException extends RuntimeException {

    /** 중복된 키 구분: CODE_ID(코드정보), DETAIL_CODE_ID(코드리스트) */
    private final String duplicateKey;
    /** 코드리스트 중복 시 해당 행 인덱스 (0-based), 코드정보 중복 시 null */
    private final Integer duplicateDetailIndex;

    public CmmnCodeDuplicateKeyException(String message, String duplicateKey, Integer duplicateDetailIndex) {
        super(message);
        this.duplicateKey = duplicateKey;
        this.duplicateDetailIndex = duplicateDetailIndex;
    }
}
