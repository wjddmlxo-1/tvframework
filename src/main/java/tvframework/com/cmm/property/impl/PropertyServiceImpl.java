package tvframework.com.cmm.property.impl;

import java.util.HashMap;
import java.util.Map;

import tvframework.com.cmm.property.PropertyService;

/**
 * Properties 서비스 구현 클래스
 * EgovPropertyServiceImpl을 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class PropertyServiceImpl implements PropertyService {
    
    private Map<String, String> properties = new HashMap<>();
    
    /**
     * Properties를 설정한다.
     * 
     * @param properties Properties 맵
     */
    public void setProperties(Map<String, String> properties) {
        this.properties = properties != null ? properties : new HashMap<>();
    }
    
    @Override
    public String getString(String key) {
        return properties.get(key);
    }
    
    @Override
    public String getString(String key, String defaultValue) {
        String value = properties.get(key);
        return value != null ? value : defaultValue;
    }
    
    @Override
    public int getInt(String key) {
        String value = properties.get(key);
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    @Override
    public int getInt(String key, int defaultValue) {
        String value = properties.get(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
    
    @Override
    public boolean getBoolean(String key) {
        String value = properties.get(key);
        if (value == null) {
            return false;
        }
        return Boolean.parseBoolean(value.trim());
    }
    
    @Override
    public boolean getBoolean(String key, boolean defaultValue) {
        String value = properties.get(key);
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value.trim());
    }
    
    /**
     * 리소스 정리 (destroy 메서드)
     */
    public void destroy() {
        properties.clear();
    }
}

