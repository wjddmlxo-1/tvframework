package tvframework.com.cmm.trace;

/**
 * 추적 처리 ?�래??
 * EgovFrame??LeaveaTrace�??�체하???�래??
 * 
 * @author 공통 개발?�
 * @since 2025.01.01
 * @version 1.0
 */
public class LeaveaTrace {
    
    private TraceHandlerService[] traceHandlerServices;
    
    /**
     * 추적 ?�들???�비?��? ?�정?�다.
     * 
     * @param traceHandlerServices 추적 ?�들???�비??배열
     */
    public void setTraceHandlerServices(TraceHandlerService[] traceHandlerServices) {
        this.traceHandlerServices = traceHandlerServices;
    }
    
    /**
     * 추적 메시지�?처리?�다.
     * 
     * @param clazz ?�래??
     * @param message 메시지
     */
    public void trace(Class<?> clazz, String message) {
        if (traceHandlerServices != null) {
            for (TraceHandlerService service : traceHandlerServices) {
                if (service != null) {
                    service.trace(clazz, message);
                }
            }
        }
    }
}

