package tvframework.com.cmm.validation;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/**
 * DefaultBeanValidator ?��??�래??
 * Spring??기본 Validator�??�용
 * 
 * @author 공통 개발?�
 * @since 2025.01.01
 * @version 1.0
 */
public class DefaultBeanValidator implements Validator {
    
    private Validator validator;
    
    public void setValidatorFactory(Object validatorFactory) {
        // ValidatorFactory???�용?��? ?�음
        // Spring??기본 Validator�??�용
    }
    
    public void setValidator(Validator validator) {
        this.validator = validator;
    }
    
    @Override
    public boolean supports(Class<?> clazz) {
        return validator != null && validator.supports(clazz);
    }
    
    @Override
    public void validate(Object target, Errors errors) {
        if (validator != null) {
            validator.validate(target, errors);
        }
    }
    
    /**
     * Bean??검증한??
     * 
     * @param target 검�??�??객체
     * @param bindingResult 바인??결과
     */
    public void validateBean(Object target, org.springframework.validation.BindingResult bindingResult) {
        if (validator != null && validator.supports(target.getClass())) {
            validator.validate(target, bindingResult);
        }
    }
}





