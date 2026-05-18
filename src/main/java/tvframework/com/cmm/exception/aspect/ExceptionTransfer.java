package tvframework.com.cmm.exception.aspect;

import org.aspectj.lang.JoinPoint;

import tvframework.com.cmm.exception.ExceptionHandlerService;

/**
 * 예외 전송 클래스
 * EgovFrame의 ExceptionTransfer를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class ExceptionTransfer {
    
    private ExceptionHandlerService[] exceptionHandlerServices;
    
    /**
     * 예외 핸들러 서비스를 설정한다.
     * 
     * @param exceptionHandlerServices 예외 핸들러 서비스 배열
     */
    public void setExceptionHandlerService(ExceptionHandlerService[] exceptionHandlerServices) {
        this.exceptionHandlerServices = exceptionHandlerServices;
    }
    /**
     * 예외를 전송한다.
     * 
     * @param thisJoinPoint 조인 포인트
     * @param ex 예외
     * @throws Exception
     */
    public void transfer(JoinPoint thisJoinPoint, Exception ex) throws Exception {
        if (exceptionHandlerServices != null) {
            String className = thisJoinPoint.getTarget().getClass().getName();
            for (ExceptionHandlerService service : exceptionHandlerServices) {
                if (service != null) {
                    service.handleException(className, ex);
                }
            }
        }
    }
}

