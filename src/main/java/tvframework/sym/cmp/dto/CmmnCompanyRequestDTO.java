package tvframework.sym.cmp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * 회사정보 등록/수정 요청 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CmmnCompanyRequestDTO {

    private String cmpnyCd;
    private String cmpnyNm;
    private String entrprsGb;
    private String bsnsNo;
    private String cprNo;
    private String cxfc;
    private String nationCd;
    private String zipCd;
    private String adresOne;
    private String adresTwo;
    private String cityNm;
    private String stateNm;
    private String offmTelno;
    private String fxnum;
    private String indutyCd;
    private String sbscrbSttus;
    private String exprtnYmd;
    private String applcntNm;
    private String applcntEmail;
    private String applcntId;
    private String useFl;
}
