package tvframework.com.cmm.exception;

/**
 * 비즈니스 예외 클래스
 * EgovBizException을 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class BizException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    public BizException() {
        super();
    }
    
    public BizException(String message) {
        super(message);
    }
    
    public BizException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public BizException(Throwable cause) {
        super(cause);
    }
}