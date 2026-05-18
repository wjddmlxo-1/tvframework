package tvframework.com.cmm;

import java.util.Locale;

import org.springframework.context.support.ReloadableResourceBundleMessageSource;

/**
 * 메시지 리소???�용???�한 MessageSource ?�터?�이??�?ReloadableResourceBundleMessageSource ?�래?�의 구현�?
 * @author 공통?�비??개발?� ?�문준
 * @since 2009.06.01
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *   
 *   ?�정??     ?�정??          ?�정?�용
 *  -------    --------    ---------------------------
 *   2009.03.11  ?�문준          최초 ?�성
 *
 * </pre>
 */

public class MessageSource extends ReloadableResourceBundleMessageSource implements org.springframework.context.MessageSource {

	private ReloadableResourceBundleMessageSource reloadableResourceBundleMessageSource;

	/**
	 * getReloadableResourceBundleMessageSource() 
	 * @param reloadableResourceBundleMessageSource - resource MessageSource
	 * @return ReloadableResourceBundleMessageSource
	 */	
	public void setReloadableResourceBundleMessageSource(ReloadableResourceBundleMessageSource reloadableResourceBundleMessageSource) {
		this.reloadableResourceBundleMessageSource = reloadableResourceBundleMessageSource;
	}
	
	/**
	 * getReloadableResourceBundleMessageSource() 
	 * @return ReloadableResourceBundleMessageSource
	 */	
	public ReloadableResourceBundleMessageSource getReloadableResourceBundleMessageSource() {
		return reloadableResourceBundleMessageSource;
	}

	/**
	 * Default Locale ?�의??메세지 조회
	 * @param code - 메세지 코드
	 * @return String
	 */	
	public String getMessage(String code) {
		return this.getMessage(code, Locale.getDefault());
	}
	/**
	 * ?�의??메세지 조회
	 * @param code - 메세지 코드
	 * @param locale - locale ?�정
	 * @return String
	 */
	public String getMessage(String code, Locale locale) {
		return getReloadableResourceBundleMessageSource().getMessage(code, null, locale);
	}

}
