package tvframework.com.cmm.property;

/**
 * Properties 서비스 인터페이스
 * EgovPropertyService를 대체하는 인터페이스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface PropertyService {
    
    /**
     * String 값을 반환한다.
     * 
     * @param key 키
     * @return 값
     */
    String getString(String key);
    
    /**
     * String 값을 반환한다. (기본값 포함)
     * 
     * @param key 키
     * @param defaultValue 기본값
     * @return 값
     */
    String getString(String key, String defaultValue);
    
    /**
     * Integer 값을 반환한다.
     * 
     * @param key 키
     * @return 값
     */
    int getInt(String key);
    
    /**
     * Integer 값을 반환한다. (기본값 포함)
     * 
     * @param key 키
     * @param defaultValue 기본값
     * @return 값
     */
    int getInt(String key, int defaultValue);
    
     /**
     * Boolean 값을 반환한다.
     * 
     * @param key 키
     * @return 값
     */
    boolean getBoolean(String key);
    
    /**
     * Boolean 값을 반환한다. (기본값 포함)
     * 
     * @param key 키
     * @param defaultValue 기본값
     * @return 값
     */
    boolean getBoolean(String key, boolean defaultValue);
}

