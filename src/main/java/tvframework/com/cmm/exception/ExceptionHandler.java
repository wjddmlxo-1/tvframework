package tvframework.com.cmm.exception;

/**
 * 예외 핸들러 인터페이스
 * EgovFrame의 ExceptionHandler를 대체하는 인터페이스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface ExceptionHandler {
    
    /**
     * 예외를 처리한다.
     * 
     * @param ex 예외
     * @param packageName 패키지명
     */
    void occur(Exception ex, String packageName);
}

