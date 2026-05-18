package tvframework.sym.usr.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자조직구성원 정보 DTO (CM_USER_ORGNZT_MBRSH)
 */
@Getter
@Setter
public class CmmnUserOrgnztMbrshDTO {
    private Long mbrshSq;
    private String userId;
    private String cmpnyCd;
    private String deptCd;
    private String emplNo;
    private String offmTelno;
    private String emailAdres;
    private String ofcpsCd;
    private String ecnyYmd;
    private String retireYmd;
    private String useFl;
}
