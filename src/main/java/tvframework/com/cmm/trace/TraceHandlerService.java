package tvframework.com.cmm.trace;

/**
 * 추적 ?�들???�비???�터?�이??
 * 
 * @author 공통 개발?�
 * @since 2025.01.01
 * @version 1.0
 */
public interface TraceHandlerService {
    
    /**
     * 추적 메시지�?처리?�다.
     * 
     * @param clazz ?�래??
     * @param message 메시지
     */
    void trace(Class<?> clazz, String message);
}

