package tvframework.com.cmm.trace.manager;

import java.util.regex.Pattern;

import org.springframework.util.AntPathMatcher;

import tvframework.com.cmm.trace.TraceHandler;
import tvframework.com.cmm.trace.TraceHandlerService;

/**
 * 기본 추적 ?�들??관리자
 * EgovFrame??DefaultTraceHandleManager�??�체하???�래??
 * 
 * @author 공통 개발?�
 * @since 2025.01.01
 * @version 1.0
 */
public class DefaultTraceHandleManager implements TraceHandlerService {
    
    private AntPathMatcher reqExpMatcher;
    private String[] patterns;
    private TraceHandler[] handlers;
    
    /**
     * ?�청 ?�현??매처�??�정?�다.
     * 
     * @param reqExpMatcher ?�청 ?�현??매처
     */
    public void setReqExpMatcher(AntPathMatcher reqExpMatcher) {
        this.reqExpMatcher = reqExpMatcher;
    }
    
    /**
     * ?�턴???�정?�다.
     * 
     * @param patterns ?�턴 배열
     */
    public void setPatterns(String[] patterns) {
        this.patterns = patterns;
    }
    
    /**
     * ?�들?��? ?�정?�다.
     * 
     * @param handlers ?�들??배열
     */
    public void setHandlers(TraceHandler[] handlers) {
        this.handlers = handlers;
    }
    
    @Override
    public void trace(Class<?> clazz, String message) {
        if (handlers == null || handlers.length == 0) {
            return;
        }
        
        String className = clazz.getName();
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
            for (TraceHandler handler : handlers) {
                if (handler != null) {
                    handler.todo(clazz, message);
                }
            }
        }
    }
}

