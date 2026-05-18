package tvframework.com.config;

import tvframework.com.cmm.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

/**
 * fileName       : ConfigAppMsg
 * author         : crlee
 * date           : 2023/05/05
 * description    :
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2023/05/05        crlee       최초 생성
 */
@Configuration
public class ConfigAppMsg {

     /**
     * @return [Resource 설정] 메세지 Properties 경로 설정
     */
    @Bean
    public ReloadableResourceBundleMessageSource messageSource() {
        ReloadableResourceBundleMessageSource reloadableResourceBundleMessageSource = new ReloadableResourceBundleMessageSource();

        reloadableResourceBundleMessageSource.setBasenames(
                "classpath:/egovframework/message/com/message-common");
        reloadableResourceBundleMessageSource.setCacheSeconds(60);
        return reloadableResourceBundleMessageSource;
    }

    /**
     * @return [Resource 설정] 메세지 소스 등록
     */
    @Bean
    public MessageSource egovMessageSource() {
        MessageSource msgSource = new MessageSource();
        msgSource.setReloadableResourceBundleMessageSource(messageSource());
        return msgSource;
    }

}
