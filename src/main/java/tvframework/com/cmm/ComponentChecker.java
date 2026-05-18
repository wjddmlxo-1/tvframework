package tvframework.com.cmm;

import tvframework.com.cmm.service.AbstractServiceImpl;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;


/**
 * EgovComUtil ?�래??
 *
 * @author ?��???
 * @since 2011.09.15
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *   ?�정??     ?�정??          ?�정?�용
 *  -------    -------------    ----------------------
 *   2011.09.15  ?��???       최초 ?�성
 * </pre>
 */

@Service("egovUtil")
public class ComponentChecker extends AbstractServiceImpl implements ApplicationContextAware{


	public static ApplicationContext context;

	@Override
	@SuppressWarnings("static-access")
	public void setApplicationContext(ApplicationContext context)
		throws BeansException {

		this.context = context;
	}

	/**
	 * Spring MVC?�서 ?�정??빈이 ?�닌 ?�비??�?컴포?�트)만을 검?�할 ???�음
	 *
	*/
	public static boolean hasComponent(String componentName){

		try{
			Object component = context.getBean(componentName);

			// Fix: Null pointers should not be dereferenced ?�슈 ?�정
			if(ObjectUtils.isEmpty(component)){
				return false;
			}else{
				return true;
			}

		}catch(NoSuchBeanDefinitionException ex){// ?�당 컴포?�트�?찾을 ?�없??경우 false반환
			return false;
		}
	}

}
