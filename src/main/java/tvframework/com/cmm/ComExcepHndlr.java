package tvframework.com.cmm;

import tvframework.com.cmm.exception.ExceptionHandler;

import lombok.extern.slf4j.Slf4j;

/**
 * @Class Name : ComExcepHndlr.java
 * @Description : 공통?�비?�의 exception 처리 ?�래??
 * @Modification Information
 *
 *    ?�정??      ?�정??        ?�정?�용
 *    -------        -------     -------------------
 *    2009. 3. 13.     ?�삼??
 *
 * @author 공통 ?�비??개발?� ?�삼??
 * @since 2009. 3. 13.
 * @version
 * @see
 *
 */
@Slf4j
public class ComExcepHndlr implements ExceptionHandler {


    /**
     * 발생??Exception??처리?�다.
     */
    public void occur(Exception ex, String packageName) {
		log.debug("[HANDLER][PACKAGE]::: {}", packageName);
		log.debug("[HANDLER][Exception]:::", ex);
    }
}
