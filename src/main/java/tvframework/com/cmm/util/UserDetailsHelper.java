package tvframework.com.cmm.util;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import tvframework.com.cmm.LoginVO;

/**
 * EgovUserDetails Helper ?�래??
 *
 * @author sjyoon
 * @since 2009.06.01
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *   ?�정??     ?�정??          ?�정?�용
 *  -------    -------------    ----------------------
 *   2009.03.10  sjyoon    최초 ?�성
 *   2011.08.31  JJY            경량?�경 ?�플�?커스?�마?�징버전 ?�성
 *
 * </pre>
 */

public class UserDetailsHelper {

		/**
		 * ?�증???�용?�객체�? VO?�식?�로 가?�온??
		 * @return Object - ?�용??ValueObject
		 */
		public static Object getAuthenticatedUser() {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			return (LoginVO) authentication.getPrincipal();

		}

		/**
		 * ?�증???�용?�의 권한 ?�보�?가?�온??
		 * ?? [ROLE_ADMIN, ROLE_USER, ROLE_A, ROLE_B, ROLE_RESTRICTED, IS_AUTHENTICATED_FULLY, IS_AUTHENTICATED_REMEMBERED, IS_AUTHENTICATED_ANONYMOUSLY]
		 * @return List - ?�용??권한?�보 목록
		 */
		public static List<String> getAuthorities() {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			return authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
		}

		/**
		 * ?�증???�용???��?�?체크?�다.
		 * @return Boolean - ?�증???�용???��?(TRUE / FALSE)
		 */
		public static Boolean isAuthenticated() {
			return UserDetailsHelper.getAuthenticatedUser()!=null? Boolean.TRUE : Boolean.FALSE ;

		}
}
