package tvframework.com.cmm.exception;

/**
 * 예외 핸들러 서비스 인터페이스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface ExceptionHandlerService {
    
    /**
     * 예외를 처리한다.
     * 
     * @param className 클래스명
     * @param ex 예외
     */
    void handleException(String className, Exception ex);
}

