package tvframework.com.cmm;

import tvframework.com.cmm.trace.TraceHandler;

import lombok.extern.slf4j.Slf4j;

/**
 * @Class Name : ComTraceHandler.java
 * @Description : 공통?�비?�의 trace 처리 ?�래??
 * @Modification Information
 *
 *    ?�정??      ?�정??        ?�정?�용
 *    -------        -------     -------------------
 *    2011. 09. 30.     JJY
 *
 * @author JJY
 * @since 2011. 9. 30.
 *
 */
@Slf4j
public class ComTraceHandler implements TraceHandler {

    /**
     * 발생??메시지�?출력?�다.
     */
    public void todo(Class<?> clazz, String message) {
    	//log.debug("log ==> DefaultTraceHandler run...............");
    	log.debug("[TRACE]CLASS::: {}", clazz.getName());
    	log.debug("[TRACE]MESSAGE::: {}", message);
    	//?�곳?�서 ?�속처리�??�요???�션??취할 ???�다.
    }
}
