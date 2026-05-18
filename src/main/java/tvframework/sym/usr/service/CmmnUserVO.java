package tvframework.sym.usr.service;

import java.io.Serializable;

import org.apache.commons.lang3.builder.ToStringBuilder;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 사용자(회원) VO
 */
@Schema(description = "사용자 VO")
@Getter
@Setter
public class CmmnUserVO extends UserDefaultVO implements Serializable {

	private static final long serialVersionUID = 1L;

	private String oldPassword = "";
	private String uniqId = "";
	private String userTy = "";
	private String adres = "";
	private String detailAdres = "";
	private String endTelno = "";
	private String mberFxnum = "";
	private String orgnztId = "";
	private String groupId = "";
	private String ihidnum = "";
	private String sexdstnCode = "";
	private String mberId;
	private String mberNm;
	private String mberSttus;
	private String areaNo = "";
	private String middleTelno = "";
	private String moblphonNo = "";
	private String password;
	private String passwordCnsr = "";
	private String passwordHint = "";
	private String sbscrbDe;
	private String zip = "";
	private String mberEmailAdres = "";
	private String checkIdResult;

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
