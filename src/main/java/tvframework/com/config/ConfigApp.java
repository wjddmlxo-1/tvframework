package tvframework.com.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

@Configuration
@Import({
	ConfigAppAspect.class,
	ConfigAppCommon.class,
	ConfigAppDatasource.class,
	ConfigAppIdGen.class,
	ConfigAppProperties.class,
	ConfigAppMapper.class,
	ConfigAppTransaction.class,
	ConfigAppValidator.class,
	ConfigAppWhitelist.class
})
@PropertySources({
	@PropertySource("classpath:/application.properties")
}) //CAUTION: min JDK 8
public class ConfigApp {

}
