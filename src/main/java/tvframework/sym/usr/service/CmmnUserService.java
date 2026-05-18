package tvframework.sym.usr.service;

import java.util.Map;

/**
 * 사용자 API 서비스 (암호변경 등)
 */
public interface CmmnUserService {

	/** 사용자 암호 변경 (로그인 사용자 본인, 기존 비밀번호 검증) */
	Integer updateUserPassword(Map<?, ?> map) throws Exception;
}
