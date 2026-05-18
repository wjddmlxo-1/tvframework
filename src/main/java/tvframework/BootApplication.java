package tvframework;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootApplication(exclude = {
	org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration.class
})
public class BootApplication {
	public static void main(String[] args) {
		log.debug("##### BootApplication Start #####");

		SpringApplication springApplication = new SpringApplication(BootApplication.class);
		springApplication.setBannerMode(Banner.Mode.OFF);
		//springApplication.setLogStartupInfo(false);
		springApplication.run(args);

		log.debug("##### BootApplication End #####");
	}

}
