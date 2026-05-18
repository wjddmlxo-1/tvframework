package tvframework.com.cmm.service.impl;

import java.util.ArrayList;
import java.util.List;

import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.UserDetailsService;

import tvframework.com.cmm.service.AbstractServiceImpl;

/**
 *
 * @author 공통?�비??개발?� ?��???
 * @since 2011. 8. 12.
 * @version 1.0
 * @see
 *
 * <pre>
 * 개정?�력(Modification Information)
 *
 *   ?�정??     ?�정??         ?�정?�용
 *  -------    --------    ---------------------------
 *  2011. 8. 12.    ?��???       최초?�성
 *
 *  </pre>
 */

public class TestUserDetailsServiceImpl extends AbstractServiceImpl implements
		UserDetailsService {

	@Override
	public Object getAuthenticatedUser() {

		LoginVO loginVO = new LoginVO();
		loginVO.setId("TEST1");
		loginVO.setPassword("raHLBnHFcunwNzcDcfad4PhD11hHgXSUr7fc1Jk9uoQ=");
		loginVO.setUserSe("USR");
		loginVO.setEmail("egovframe@nia.or.kr");
		loginVO.setIhidNum("");
		loginVO.setName("테스트사용자");
		loginVO.setOrgnztId("ORGNZT_0000000000000");
		loginVO.setUniqId("USRCNFRM_00000000000");
		return loginVO;

		// return
		// RequestContextHolder.getRequestAttributes().getAttribute("loginVO",
		// RequestAttributes.SCOPE_SESSION);

	}

	@Override
	public List<String> getAuthorities() {

		// 권한 ?�정??리턴?�다.

		List<String> listAuth = new ArrayList<String>();
		listAuth.add("IS_AUTHENTICATED_ANONYMOUSLY");
		listAuth.add("IS_AUTHENTICATED_FULLY");
		listAuth.add("IS_AUTHENTICATED_REMEMBERED");
		listAuth.add("ROLE_ADMIN");
		listAuth.add("ROLE_ANONYMOUS");
		listAuth.add("ROLE_RESTRICTED");
		listAuth.add("ROLE_USER");

		return listAuth;
	}

	@Override
	public Boolean isAuthenticated() {
		// ?�증???��??��? ?�인?�다.

		/*if (RequestContextHolder.getRequestAttributes() == null) {
			return false;
		} else {

			if (RequestContextHolder.getRequestAttributes().getAttribute(
					"loginVO", RequestAttributes.SCOPE_SESSION) == null) {
				return false;
			} else {
				return true;
			}
		}*/

		return true;
	}

}
