package tvframework.com.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.ObjectMapper;

import tvframework.com.config.HtmlCharacterEscapes;

import java.util.List;

/**
 * fileName       : WebMvcConfig
 * author         : crlee
 * date           : 2023/07/13
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/07/13        crlee       최초 생성
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
	
	private final ObjectMapper objectMapper;
	
	// ObjectMapper를 선택적으로 주입받거나, 없으면 기본 ObjectMapper 생성
	public WebMvcConfig(org.springframework.beans.factory.BeanFactory beanFactory) {
		ObjectMapper mapper;
		try {
			mapper = beanFactory.getBean(ObjectMapper.class);
		} catch (org.springframework.beans.factory.NoSuchBeanDefinitionException e) {
			mapper = new com.fasterxml.jackson.databind.ObjectMapper();
		}
		this.objectMapper = mapper;
	}
	
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new CustomAuthenticationPrincipalResolver());
    }
    
    @Bean
    public HttpMessageConverter<?> htmlEscapingConverter() {
        ObjectMapper copy = objectMapper.copy();
        copy.getFactory().setCharacterEscapes(new HtmlCharacterEscapes());
        return new MappingJackson2HttpMessageConverter(copy);
    }
    
}
