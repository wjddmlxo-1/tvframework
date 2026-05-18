package tvframework.com.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.util.AntPathMatcher;

import tvframework.com.cmm.ComExcepHndlr;
import tvframework.com.cmm.ComOthersExcepHndlr;
import tvframework.com.cmm.interceptor.AopExceptionTransfer;
import tvframework.com.cmm.exception.aspect.ExceptionTransfer;
import tvframework.com.cmm.exception.ExceptionHandler;
import tvframework.com.cmm.exception.manager.DefaultExceptionHandleManager;
import tvframework.com.cmm.exception.ExceptionHandlerService;

/**
 * @ClassName : ConfigAppAspect.java
 * @Description : Aspect 설정
 *
 * @author : 윤주호
 * @since  : 2021. 7. 20
 * @version : 1.0
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일              수정자               수정내용
 *  -------------  ------------   ---------------------
 *   2021. 7. 20    윤주호               최초 생성
 * </pre>
 *
 */
@Configuration
@EnableAspectJAutoProxy
public class ConfigAppAspect {

	@Bean
	public ComExcepHndlr egovHandler() {
		ComExcepHndlr comExcepHndlr = new ComExcepHndlr();
		return comExcepHndlr;
	}

	@Bean
	public ComOthersExcepHndlr otherHandler() {
		ComOthersExcepHndlr comOthersExcepHndlr = new ComOthersExcepHndlr();
		return comOthersExcepHndlr;
	}

	@Bean
    public DefaultExceptionHandleManager defaultExceptionHandleManager(ExceptionHandler egovHandler, AntPathMatcher antPathMatcher) {
		DefaultExceptionHandleManager defaultExceptionHandleManager = new DefaultExceptionHandleManager();
		defaultExceptionHandleManager.setReqExpMatcher(antPathMatcher);
		defaultExceptionHandleManager.setPatterns(new String[] {"**service.impl.*"});
		defaultExceptionHandleManager.setHandlers(new ExceptionHandler[] {egovHandler});
		return defaultExceptionHandleManager;
	}

	@Bean
    public DefaultExceptionHandleManager otherExceptionHandleManager(AntPathMatcher antPathMatcher) {
		DefaultExceptionHandleManager defaultExceptionHandleManager = new DefaultExceptionHandleManager();
		defaultExceptionHandleManager.setReqExpMatcher(antPathMatcher);
		defaultExceptionHandleManager.setPatterns(new String[] {"**service.impl.*"});
		defaultExceptionHandleManager.setHandlers(new ExceptionHandler[] {otherHandler()});
		return defaultExceptionHandleManager;
	}

	/**
	 * @return
	 * Exception 발생시 후처리를 위해 표준프레임워크 실행환경의 ExceptionTransfer를 활용하도록  설정
	 */
	@Bean
	public ExceptionTransfer exceptionTransfer(
		@Qualifier("defaultExceptionHandleManager") DefaultExceptionHandleManager defaultExceptionHandleManager,
		@Qualifier("otherExceptionHandleManager") DefaultExceptionHandleManager otherExceptionHandleManager) {
		ExceptionTransfer exceptionTransfer = new ExceptionTransfer();
		exceptionTransfer.setExceptionHandlerService(new ExceptionHandlerService[] {
			defaultExceptionHandleManager, otherExceptionHandleManager
		});
		return exceptionTransfer;
	}

	@Bean
	public AopExceptionTransfer aopExceptionTransfer(ExceptionTransfer exceptionTransfer) {
		AopExceptionTransfer aopExceptionTransfer = new AopExceptionTransfer();
		aopExceptionTransfer.setExceptionTransfer(exceptionTransfer);
		return aopExceptionTransfer;
	}

}
