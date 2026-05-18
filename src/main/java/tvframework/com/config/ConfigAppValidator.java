package tvframework.com.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import tvframework.com.cmm.validation.DefaultBeanValidator;
import org.springframework.validation.Validator;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

/**
 * @ClassName : ConfigAppValidator.java
 * @Description : Validator 설정
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
public class ConfigAppValidator {

	@Bean
	public DefaultBeanValidator beanValidator() {
		DefaultBeanValidator defaultBeanValidator = new DefaultBeanValidator();
		LocalValidatorFactoryBean factory = validatorFactory();
		factory.afterPropertiesSet(); // 초기화
		defaultBeanValidator.setValidator(factory); // LocalValidatorFactoryBean의 Spring Validator를 구현
		return defaultBeanValidator;
	}

	/** validation config location 설정
	 * @return
	 */
	@Bean
	public LocalValidatorFactoryBean validatorFactory() {
		LocalValidatorFactoryBean validatorFactory = new LocalValidatorFactoryBean();
		// Spring의 기본 validation을 사용
		return validatorFactory;
	}

	private Resource[] getValidationConfigLocations() {

		PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver = new PathMatchingResourcePatternResolver();

		List<Resource> validationConfigLocations = new ArrayList<Resource>();

		Resource[] validationRulesConfigLocations = new Resource[] {
			pathMatchingResourcePatternResolver
				.getResource("classpath:/tvframework/validator/validator-rules-let.xml")
		};

		Resource[] validationFormSetLocations = new Resource[] {};
		try {
			validationFormSetLocations = pathMatchingResourcePatternResolver
				.getResources("classpath:/tvframework/validator/let/**/*.xml");
		} catch (IOException e) {
			// TODO Exception 처리 필요
		}

		validationConfigLocations.addAll(Arrays.asList(validationRulesConfigLocations));
		validationConfigLocations.addAll(Arrays.asList(validationFormSetLocations));

		return validationConfigLocations.toArray(new Resource[validationConfigLocations.size()]);
	}
}
