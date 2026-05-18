package tvframework.com.config;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

import tvframework.com.cmm.service.AppProperties;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebServletContextListener implements ServletContextListener {
	
	public WebServletContextListener() {
		setEgovProfileSetting();
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
		if (System.getProperty("spring.profiles.active") == null) {
			setEgovProfileSetting();
		}
	}

	@Override
	public void contextDestroyed(ServletContextEvent event) {
		if (System.getProperty("spring.profiles.active") != null) {
			System.clearProperty("spring.profiles.active");
		}
	}

	public void setEgovProfileSetting() {
		try {
			log.debug("===========================Start EgovServletContextLoad START ===========");
			System.setProperty("spring.profiles.active",
					AppProperties.getProperty("Globals.DbType") + "," + AppProperties.getProperty("Globals.Auth"));
			log.debug("Setting spring.profiles.active>" + System.getProperty("spring.profiles.active"));
			log.debug("===========================END   EgovServletContextLoad END ===========");
		} catch (IllegalArgumentException e) {
			log.error("[IllegalArgumentException] Try/Catch...usingParameters Runing : " + e.getMessage());
		}
	}
}
