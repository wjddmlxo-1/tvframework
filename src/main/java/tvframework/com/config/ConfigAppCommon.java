package tvframework.com.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import tvframework.com.cmm.ComTraceHandler;
import tvframework.com.cmm.ImagePaginationRenderer;
import tvframework.com.cmm.web.MultipartResolver;

import tvframework.com.cmm.trace.LeaveaTrace;
import tvframework.com.cmm.trace.TraceHandler;
import tvframework.com.cmm.trace.manager.DefaultTraceHandleManager;
import tvframework.com.cmm.trace.TraceHandlerService;
import tvframework.com.cmm.crypto.PasswordEncoder;
import tvframework.com.cmm.crypto.impl.ARIACryptoServiceImpl;
import tvframework.com.cmm.pagination.DefaultPaginationManager;
import tvframework.com.cmm.pagination.PaginationRenderer;

/**
 * @ClassName : ConfigAppCommon.java
 * @Description : 공통 Bean 설정
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
 *   2023. 5. 05    crlee              remove EgovMessageSource config
 * </pre>
 *
 */
@Configuration
@ComponentScan(basePackages = "tvframework", includeFilters = {
	@ComponentScan.Filter(type = FilterType.ANNOTATION, value = Service.class),
	@ComponentScan.Filter(type = FilterType.ANNOTATION, value = Repository.class)
}, excludeFilters = {
	@ComponentScan.Filter(type = FilterType.ANNOTATION, value = Controller.class),
	@ComponentScan.Filter(type = FilterType.ANNOTATION, value = Configuration.class)
})
public class ConfigAppCommon {

	/**
	 * @return AntPathMatcher 등록.  Ant 경로 패턴 경로와 일치하는지 여부를 확인
	 */
	@Bean
	public AntPathMatcher antPathMatcher() {
		return new AntPathMatcher();
	}


	/**
	 * @return [LeaveaTrace 설정] defaultTraceHandler 등록
	 */
	@Bean
	public ComTraceHandler defaultTraceHandler() {
		return new ComTraceHandler();
	}

	/**
	 * @return [LeaveaTrace 설정] traceHandlerService 등록. TraceHandler 설정
	 */
	@Bean
	public DefaultTraceHandleManager traceHandlerService() {
		DefaultTraceHandleManager defaultTraceHandleManager = new DefaultTraceHandleManager();
		defaultTraceHandleManager.setReqExpMatcher(antPathMatcher());
		defaultTraceHandleManager.setPatterns(new String[] {"*"});
		defaultTraceHandleManager.setHandlers(new TraceHandler[] {defaultTraceHandler()});
		return defaultTraceHandleManager;
	}

	/**
	 * @return [LeaveaTrace 설정] LeaveaTrace 등록
	 */
	@Bean
	public LeaveaTrace leaveaTrace() {
		LeaveaTrace leaveaTrace = new LeaveaTrace();
		leaveaTrace.setTraceHandlerServices(new TraceHandlerService[] {traceHandlerService()});
		return leaveaTrace;
	}

	/**
	 * @return [ImagePaginationRenderer 설정] ImagePaginationRenderer 등록
	 */
	@Bean
	public ImagePaginationRenderer imageRenderer() {
		return new ImagePaginationRenderer();
	}

	/**
	 * @return [ImagePaginationRenderer 설정] defaultPaginationManager 설정.
	 */
	@Bean
	public DefaultPaginationManager paginationManager() {
		DefaultPaginationManager defaultPaginationManager = new DefaultPaginationManager();

		Map<String, PaginationRenderer> rendererType = new HashMap<>();
		rendererType.put("image", imageRenderer());
		defaultPaginationManager.setRendererType(rendererType);

		return defaultPaginationManager;
	}

	/**
	 * @return [MultipartResolver 설정] CommonsMultipartResolver 등록
	 */
	@Bean
	public StandardServletMultipartResolver springRegularCommonsMultipartResolver() {
		StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();
		multipartResolver.setResolveLazily(true);
		return multipartResolver;
	}

	/**
	 * 확장자 제한 : globals.properties > Globals.fileUpload.Extensions로 설정
	 * @return [MultipartResolver 설정] MultipartResolver 등록
	 */
	@Bean
	public StandardServletMultipartResolver localMultiCommonsMultipartResolver() {
		StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();
		multipartResolver.setResolveLazily(true);
		return multipartResolver;
	}
	
	@Bean
	public StandardServletMultipartResolver multipartResolver() {
		return springRegularCommonsMultipartResolver();
	}
	
	/**
	 * 암복호화
	 * @return [PasswordEncoder 설정] PasswordEncoder 등록
	 */
	@Bean
	public PasswordEncoder egovPasswordEncoder() {
		PasswordEncoder passwordEncoder = new PasswordEncoder();
		passwordEncoder.setAlgorithm("SHA-256");
		passwordEncoder.setHashedPassword("gdyYs/IZqY86VcWhT8emCYfqY1ahw2vtLG+/FzNqtrQ=");
		return passwordEncoder;
	}
	
	/**
	 * 암복호화
	 * @return [ARIACryptoServiceImpl 설정] ARIACryptoServiceImpl 등록
	 */
	@Bean
	public ARIACryptoServiceImpl egovARIACryptoService() {
		ARIACryptoServiceImpl ariaCryptoServiceImpl = new ARIACryptoServiceImpl();
		ariaCryptoServiceImpl.setPasswordEncoder(egovPasswordEncoder());
		ariaCryptoServiceImpl.setBlockSize(1024);
		return ariaCryptoServiceImpl;
	}
}
