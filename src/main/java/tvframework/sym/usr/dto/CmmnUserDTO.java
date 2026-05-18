package tvframework.sym.usr.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자 정보 DTO (CM_USER)
 */
@Getter
@Setter
public class CmmnUserDTO {
    private String userId;
    private String userNm;
    private String userEngNm;
    /** CM_USER.USER_TYPE (USER/MEMBER 등) */
    private String userType;
    private String password;
    private String ihidnum;
    private String genderCd;
    private String brthdy;
    private String passwordHint;
    private String passwordCnsr;
    private String nationCd;
    private String zipCd;
    private String adresOne;
    private String adresTwo;
    private String cityNm;
    private String stateNm;
    private String houseTelno;
    private String mbtlnum;
    private String fxnum;
    private String emailAdres;
    private String userSttusCd;
    /** CM_USER.FILE_SQ — 프로필 사진(첨부 파일 키) */
    private String profileFileSq;
}
