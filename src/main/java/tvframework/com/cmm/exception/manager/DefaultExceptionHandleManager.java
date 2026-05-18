package tvframework.com.cmm.exception.manager;

import java.util.regex.Pattern;

import org.springframework.util.AntPathMatcher;

import tvframework.com.cmm.exception.ExceptionHandler;
import tvframework.com.cmm.exception.ExceptionHandlerService;

/**
 * 기본 예외 핸들러 관리자
 * EgovFrame의 DefaultExceptionHandleManager를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class DefaultExceptionHandleManager implements ExceptionHandlerService {
    
    private AntPathMatcher reqExpMatcher;
    private String[] patterns;
    private ExceptionHandler[] handlers;
    
    /**
     * 요청 표현식 매처를 설정한다.
     * 
     * @param reqExpMatcher 요청 표현식 매처
     */

    public void setReqExpMatcher(AntPathMatcher reqExpMatcher) {
        this.reqExpMatcher = reqExpMatcher;
    }
    
    /**
     * 패턴을 설정한다.
     * 
     * @param patterns 패턴 배열
     */
    public void setPatterns(String[] patterns) {
        this.patterns = patterns;
    }
    
    /**
     * 핸들러를 설정한다.
     * 
     * @param handlers 핸들러 배열
     */
    public void setHandlers(ExceptionHandler[] handlers) {
        this.handlers = handlers;
    }
    
    @Override
    public void handleException(String className, Exception ex) {
        if (handlers == null || handlers.length == 0) {
            return;
        }
        
        boolean matched = false;
        
        if (patterns != null && patterns.length > 0) {
            for (String pattern : patterns) {
                if (reqExpMatcher != null && reqExpMatcher.match(pattern, className)) {
                    matched = true;
                    break;
                } else if (pattern.equals("*") || Pattern.matches(pattern.replace("*", ".*"), className)) {
                    matched = true;
                    break;
                }
            }
        } else {
            matched = true;
        }
        
        if (matched) {
            for (ExceptionHandler handler : handlers) {
                if (handler != null) {
                    handler.occur(ex, className);
                }
            }
        }
    }
}

