package tvframework.sym.cmp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserJoinRequestDTO {
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
    private String applcntId;
    private String applcntNm;
    private String applcntEmail;
    private String useFl;
    private Boolean agreeUseTerms;
    private Boolean agreeInfoTerms;
}
