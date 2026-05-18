package tvframework.com.cmm.service.impl;

import java.util.List;

import tvframework.com.cmm.service.UserDetailsService;
import tvframework.com.cmm.util.UserDetailsHelper;

import tvframework.com.cmm.service.AbstractServiceImpl;

/**
 *
 * @author 공통?�비??개발?� ?��???
 * @since 2011. 6. 25.
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

public class UserDetailsSessionServiceImpl extends AbstractServiceImpl implements
	UserDetailsService {

	@Override
	public Object getAuthenticatedUser() {
		if (UserDetailsHelper.isAuthenticated()) {
			return UserDetailsHelper.getAuthenticatedUser();
		}
		return null;
	}

	@Override
	public List<String> getAuthorities() {
		//		return listAuth;
		return UserDetailsHelper.getAuthorities();
	}

	@Override
	public Boolean isAuthenticated() {
		// ?�증???��??��? ?�인?�다.
		return UserDetailsHelper.isAuthenticated();

	}

}
